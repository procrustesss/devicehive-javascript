var fs = require('fs');
var expect = require('chai').expect;
var vm = require('vm');
var sinon = require('sinon');

describe('Events tests', function(){
    vm.runInThisContext(fs.readFileSync('./src/core/utils/events.js'));

    afterEach(function(done){
        Events.prototype.unbind();
        done();
    });

    describe('bind()', function(){
        it('should bind right callback to event', function(){
            var cb = sinon.spy();
            Events.prototype.bind('name', cb);
            Events.prototype.trigger('name');
            expect(cb.calledOnce).to.be.true;
        });
        it('should return object with unbind method, which should unbind callback from event', function(){
            var cb = sinon.spy();
            Events.prototype.bind('name', cb).unbind();
            Events.prototype.trigger('name');
            expect(cb.called).to.be.false;
        });
    });

    describe('unbind()', function(){
        it('should throw exception when no events was bound', function(){
            expect(function() { Events.prototype.unbind('name'); }).to.throw(TypeError);
        });
        it('should return object with null _handlers property', function(){
            expect(Events.prototype.unbind()).to.have.property('_handlers', null);
        });
        it('should return right object, when no events for passed name was found', function(){
            Events.prototype.bind('name', function(){});
            var result = Events.prototype.unbind('anotherName');
            expect(Object.keys(result._handlers).length).to.be.equal(1);
        });
        it('should delete all handlers for passed name, when no callback was passed as a parameter', function(){
            Events.prototype.bind('name', function(){});
            Events.prototype.bind('name', function(){});
            Events.prototype.bind('anotherName', function(){});
            var handlerKeys = Object.keys(Events.prototype.unbind('name')._handlers);
            expect(handlerKeys.length).to.be.equal(1);
            expect(handlerKeys[0]).to.be.equal('anotherName');
        });
        it('should not unbind callback from event, if callbacks are not equal', function(){
            var originCb = sinon.spy();
            var remainingCb = sinon.spy();
            Events.prototype.bind('name', originCb);
            Events.prototype.unbind('name', remainingCb);
            Events.prototype.trigger('name');
            expect(originCb.calledOnce).to.be.true;
            expect(remainingCb.called).to.be.false;
        });
        it('should delete events with the same name and callback', function(){
            var cb = sinon.spy();
            Events.prototype.bind('name', cb);
            var handlerKeys = Object.keys(Events.prototype.unbind('name')._handlers);
            expect(handlerKeys.length).to.be.equal(0);
            Events.prototype.trigger('name');
            expect(cb.called).to.be.false;
        });
    });

    describe('trigger()', function(){
        it('should return object with null _handlers property', function(){
            expect(Events.prototype.trigger('event')).to.have.property('_handlers', null);
        });
        it('should trigger right event', function(){
            var triggeredCb = sinon.spy();
            var notTriggeredCb = sinon.spy();
            Events.prototype.bind('triggered', triggeredCb);
            Events.prototype.bind('notTriggered', notTriggeredCb);
            Events.prototype.trigger('triggered');
            expect(triggeredCb.calledOnce).to.be.true;
            expect(notTriggeredCb.called).to.be.false;
        });
    });

    describe('_triggerEvents()', function(){
        it('should trigger events with right args, and right context', function(){
            var firstCb = sinon.spy();
            var secondCb = sinon.spy();
            var firstContext = { cxt: 'first' };
            var secondContext = { cxt: 'second' };
            var args = [ 1, 2 ];
            var events = [{ context: firstContext, callback: firstCb}, { context: secondContext, callback: secondCb}];
            Events.prototype._triggerEvents(events, args);
            expect(firstCb.calledOnce).to.be.true;
            expect(firstCb.alwaysCalledWith(1, 2)).to.be.true;
            expect(firstCb.alwaysCalledOn(firstContext)).to.be.true;
            expect(secondCb.calledOnce).to.be.true;
            expect(secondCb.alwaysCalledWith(1, 2)).to.be.true;
            expect(secondCb.alwaysCalledOn(secondContext)).to.be.true;
        });
    });
});
