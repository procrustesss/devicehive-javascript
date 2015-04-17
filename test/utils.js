var fs = require('fs');
var expect = require('chai').expect;
var vm = require('vm');

describe('Utils tests', function(){
    vm.runInThisContext(fs.readFileSync('./src/core/utils/utils.js'));
    describe('noop()', function(){
        it('should return undefined', function(){
            expect(utils.noop()).to.be.an('undefined');
        });
    });
    describe('isString(arg)', function(){
        it('should return true when string object is passed', function(){
            expect(utils.isString('Lorem ipsum')).to.be.true;
        });
        it('should return false when simple object is passed', function(){
            expect(utils.isString({str: "Lorem ipsum"})).to.be.false;
        });
        it('should return false when number is passed', function(){
            expect(utils.isString(4)).to.be.false;
        });
        it('should return false when undefined is passed', function(){
            expect(utils.isString(undefined)).to.be.false;
        });
        it('should return false when null is passed', function(){
            expect(utils.isString(null)).to.be.false;
        });
    });
    describe('guid()', function(){
        it('should return GUID with valid format', function(){
            var guidRegEx = /^(\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-4([0-9a-fA-F]){3}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\}{0,1})$/;
            expect(guidRegEx.test(utils.guid())).to.be.true;
        });
        it('should return unique GUIDs (test sample of 5 elements)', function(){
            var guids = [];

            for(var i = 0; i < 5; i++){
                guids.push(utils.guid());
            }
            
            for(var i = 0; i < 4; i++){
                expect(guids.indexOf(guids[i], i + 1)).to.equal(-1);
            }
        });
    });
});