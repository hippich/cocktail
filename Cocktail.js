//     Cocktail.js 0.2.0
//     (c) 2012 Onsi Fakhouri
//     Cocktail.js may be freely distributed under the MIT license.
//     http://github.com/onsi/cocktail
(function() {
    var Cocktail;

    if (typeof exports !== 'undefined') {
        Cocktail = exports;
    } else {
        Cocktail = this.Cocktail = {};
    }

    Cocktail.mixin = function mixin(klass) {
        var mixins = _.chain(arguments).toArray().rest().flatten().value();

        var collisions = {};

        _(mixins).each(function(mixin) {
            _(mixin).each(function(value, key) {
                if (key == 'events') {
                    klass.prototype.events = _.extend({}, klass.prototype.events || {}, value);
                } else if (_.isFunction(value)) {
                    if (klass.prototype[key]) {
                        collisions[key] = collisions[key] || [klass.prototype[key]];
                        collisions[key].push(value);
                    }
                    klass.prototype[key] = value;
                }
            });
        });

        _(collisions).each(function(propertyValues, propertyName) {
            klass.prototype[propertyName] = function() {
                var that = this,
                    args = arguments,
                    returnValue = undefined;

                _(propertyValues).each(function(value) {
                    var returnedValue = _.isFunction(value) ? value.apply(that, args) : value;
                    returnValue = (returnedValue === undefined ? returnValue : returnedValue);
                });

                return returnValue;
            }
        });
    };

    var originalExtend;

    Cocktail.patch = function patch(Backbone) {
        originalExtend = Backbone.Model.extend;

        var extend = function(protoProps, classProps) {
            var klass = originalExtend.call(this, protoProps, classProps);

            var mixins = klass.prototype.mixins;
            if (mixins && klass.prototype.hasOwnProperty('mixins')) {
                Cocktail.mixin(klass, mixins);
            }

            return klass;
        };

        _([Backbone.Model, Backbone.Collection, Backbone.Router, Backbone.View]).each(function(klass) {
            klass.mixin = function mixin() {
                Cocktail.mixin(this, _.toArray(arguments));
            }

            klass.extend = extend;
        });
    };

    Cocktail.unpatch = function unpatch(Backbone) {
        _([Backbone.Model, Backbone.Collection, Backbone.Router, Backbone.View]).each(function(klass) {
            klass.mixin = undefined;
            klass.extend = originalExtend;
        });
    };
})();