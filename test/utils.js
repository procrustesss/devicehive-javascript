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

    describe('isFunction()', function(){
        it('should return true when gunction is passed', function(){
            expect(utils.isFunction( function(){} )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isFunction( {} )).to.be.false;
        });

        it('should return false when simple string is passed', function(){
            expect(utils.isFunction( 'test string' )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isFunction( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isFunction( undefined )).to.be.false;
        });
    });

    describe('isArray()', function(){
        it('should return true when array object is passed', function(){
            expect(utils.isArray( [1] )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isArray( {} )).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isArray( 100500 )).to.be.false;
        });

        it('should return false when string is passed', function(){
            expect(utils.isArray( 'test string' )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isArray( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isArray( undefined )).to.be.false;
        });
    });

   describe('isArrayLike()', function(){
        it('should return true when array object is passed', function(){
            expect(utils.isArrayLike( [1] )).to.be.true;
        });

        it('should return true when string is passed', function(){
            expect(utils.isArrayLike( 'test string' )).to.be.true;
        });

        it('should return false when simple object is passed', function(){
            expect(utils.isArrayLike( {} )).to.be.false;
        });

        it('should return false when number is passed', function(){
            expect(utils.isArrayLike( 100500 )).to.be.false;
        });

        it('should return false when bool is passed', function(){
            expect(utils.isArrayLike( true )).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isArrayLike( null )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isArrayLike( undefined )).to.be.false;
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

        it('should return false when bool is passed', function(){
            expect(utils.isString( true )).to.be.false;
        });

        it('should return false when undefined is passed', function(){
            expect(utils.isString(undefined)).to.be.false;
        });

        it('should return false when null is passed', function(){
            expect(utils.isString(null)).to.be.false;
        });
    });
});