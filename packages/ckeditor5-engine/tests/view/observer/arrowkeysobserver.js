/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ArrowKeysObserver from '../../../src/view/observer/arrowkeysobserver';
import { setData as setModelData } from '../../../src/dev-utils/model';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BlockQuoteEditing from '@ckeditor/ckeditor5-block-quote/src/blockquoteediting';

import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';
import { priorities } from '@ckeditor/ckeditor5-utils';

describe( 'ArrowKeysObserver', () => {
	let editor, model, view, viewDocument, observer;

	beforeEach( async () => {
		editor = await VirtualTestEditor.create( { plugins: [ Paragraph, BlockQuoteEditing ] } );

		model = editor.model;
		view = editor.editing.view;
		viewDocument = view.document;
		observer = view.getObserver( ArrowKeysObserver );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should define eventType', () => {
		expect( observer.eventType ).to.equal( 'keydown' );
	} );

	it( 'should define firedEventType', () => {
		expect( observer.firedEventType ).to.equal( 'arrowkey' );
	} );

	describe( '#_translateEvent()', () => {
		it( 'should fire arrowkey event with the same data as keydown event (arrow right)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowright };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			// Prevent other listeners (especially jump over UI element because it required DOM).
			viewDocument.on( 'keydown', event => event.stop() );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow left)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowleft };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			// Prevent other listeners (especially jump over inline filler because it required DOM).
			viewDocument.on( 'keydown', event => event.stop() );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow up)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowup };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should fire arrowkey event with the same data as keydown event (arrow down)', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should not fire arrowkey event on non arrow key press', () => {
			const spy = sinon.spy();
			const data = { keyCode: keyCodes.space };

			viewDocument.on( 'arrowkey', spy, { context: '$root' } );

			viewDocument.fire( 'keydown', data );

			expect( spy.notCalled ).to.be.true;
		} );
	} );

	describe( '#_addEventListener()', () => {
		it( 'should allow providing multiple context in one listener binding', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: [ '$text', 'p' ] } );

			viewDocument.fire( 'keydown', data );

			expect( spy.calledTwice ).to.be.true;
			expect( spy.args[ 0 ][ 1 ] ).to.equal( data );
			expect( spy.args[ 1 ][ 1 ] ).to.equal( data );
		} );

		it( 'should reuse existing context', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy1, { context: 'p' } );
			viewDocument.on( 'arrowkey', spy2, { context: 'p' } );

			viewDocument.fire( 'keydown', data );

			expect( spy1.calledOnce ).to.be.true;
			expect( spy1.args[ 0 ][ 1 ] ).to.equal( data );
			expect( spy2.calledOnce ).to.be.true;
			expect( spy2.args[ 0 ][ 1 ] ).to.equal( data );
		} );

		it( 'should prevent registering a default listener', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', event => {
				spy1();
				event.stop();
			}, { context: 'p' } );

			viewDocument.on( 'keydown', spy2 );

			viewDocument.fire( 'keydown', data );

			expect( spy1.calledOnce ).to.be.true;
			expect( spy2.notCalled ).to.be.true;
		} );
	} );

	describe( '#_removeEventListener()', () => {
		it( 'should unbind from contexts', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: 'p' } );
			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;

			viewDocument.off( 'arrowkey', spy );
			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'should not unbind from contexts if other event is off', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: 'p' } );
			viewDocument.fire( 'keydown', data );

			expect( spy.calledOnce ).to.be.true;

			viewDocument.off( 'keydown', spy );
			viewDocument.fire( 'keydown', data );

			expect( spy.calledTwice ).to.be.true;
		} );
	} );

	describe( 'event bubbling', () => {
		it( 'should not bubble events if observer is disabled', () => {
			setModelData( model, '<paragraph>foo[]bar</paragraph>' );

			const spy = sinon.spy();
			const data = { keyCode: keyCodes.arrowdown };

			viewDocument.on( 'arrowkey', spy, { context: 'p' } );

			observer.disable();
			viewDocument.fire( 'keydown', data );

			expect( spy.notCalled ).to.be.true;
		} );

		describe( 'bubbling starting from non collapsed selection', () => {
			it( 'should start bubbling from the selection anchor position', () => {
				setModelData( model,
					'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
					'<paragraph>b]ar</paragraph>'
				);

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p', 'blockquote', '$root', 'keydown@high-10' ] );
			} );

			it( 'should start bubbling from the selection focus position', () => {
				setModelData( model,
					'<blockQuote><paragraph>fo[o</paragraph></blockQuote>' +
					'<paragraph>b]ar</paragraph>',
					{ lastRangeBackward: true }
				);

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p', 'blockquote', '$root', 'keydown@high-10' ] );
			} );
		} );

		describe( 'while the selection in the text node', () => {
			it( 'should bubble events from $text to $root and to default handlers if not stopped', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p', 'blockquote', '$root', 'keydown@high-10' ] );
			} );

			it( 'should not start bubbling events if stopped before entering high priority', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'keydown', event => event.stop(), { priority: priorities.get( 'high' ) + 1 } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10' ] );
			} );

			it( 'should stop bubbling events if stopped on the $text context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: '$text' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text' ] );
			} );

			it( 'should stop bubbling events if stopped on the p context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: 'p' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p' ] );
			} );

			it( 'should stop bubbling events if stopped on the blockquote context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: 'blockquote' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p', 'blockquote' ] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: '$root' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$text', 'p', 'blockquote', '$root' ] );
			} );
		} );

		describe( 'while the selection in on some object node', () => {
			beforeEach( () => {
				model.schema.register( 'object', {
					allowWhere: '$text',
					isInline: true
				} );

				editor.conversion.elementToElement( { model: 'object', view: 'obj' } );
			} );

			it( 'should bubble events from $custom to $root (but without $text) and to default handlers if not stopped', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$custom', 'p', 'blockquote', '$root', 'keydown@high-10' ] );
			} );

			it( 'should not start bubbling events if stopped before entering high priority', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'keydown', event => event.stop(), { priority: priorities.get( 'high' ) + 1 } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10' ] );
			} );

			it( 'should stop bubbling events if stopped on the custom context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: isCustomObject } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$custom' ] );
			} );

			it( 'should stop bubbling events if stopped on the p context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: 'p' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$custom', 'p' ] );
			} );

			it( 'should stop bubbling events if stopped on the blockquote context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: 'blockquote' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$custom', 'p', 'blockquote' ] );
			} );

			it( 'should not trigger listeners on the lower priority if stopped on the $root context', () => {
				setModelData( model, '<blockQuote><paragraph>foo[<object/>]bar</paragraph></blockQuote>' );

				const data = { keyCode: keyCodes.arrowdown };
				const events = setListeners();

				viewDocument.on( 'arrowkey', event => event.stop(), { context: '$root' } );
				viewDocument.fire( 'keydown', data );

				expect( events ).to.deep.equal( [ 'keydown@high+10', '$custom', 'p', 'blockquote', '$root' ] );
			} );
		} );

		function setListeners() {
			const events = [];

			viewDocument.on( 'arrowkey', () => events.push( '$root' ), { context: '$root' } );
			viewDocument.on( 'arrowkey', () => events.push( '$text' ), { context: '$text' } );
			viewDocument.on( 'arrowkey', () => events.push( '$custom' ), { context: isCustomObject } );

			viewDocument.on( 'arrowkey', () => events.push( 'p' ), { context: 'p' } );
			viewDocument.on( 'arrowkey', () => events.push( 'blockquote' ), { context: 'blockquote' } );

			viewDocument.on( 'keydown', () => events.push( 'keydown@high+10' ), { priority: priorities.get( 'high' ) + 10 } );
			viewDocument.on( 'keydown', () => events.push( 'keydown@high-10' ), { priority: priorities.get( 'high' ) - 10 } );

			return events;
		}

		function isCustomObject( node ) {
			return node.is( 'element', 'obj' );
		}
	} );
} );
