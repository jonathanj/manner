var i18n={lc:{"en":function(n){return n===1?"one":"other"}},
c:function(d,k){if(!d)throw new Error("MessageFormat: Data required for '"+k+"'.")},
n:function(d,k,o){if(isNaN(d[k]))throw new Error("MessageFormat: '"+k+"' isn't a number.");return d[k]-(o||0)},
v:function(d,k){i18n.c(d,k);return d[k]},
p:function(d,k,o,l,p){i18n.c(d,k);return d[k] in p?p[d[k]]:(k=i18n.lc[l](d[k]-o),k in p?p[k]:p.other)},
s:function(d,k,p){i18n.c(d,k);return d[k] in p?p[d[k]]:p.other}};
i18n["validators"]={
"equal":function(d){return "Must be \""+i18n.v(d,"value")+"\""},
"notEqual":function(d){return "Must not be \""+i18n.v(d,"value")+"\""},
"lessThan":function(d){return "Must be less than "+i18n.v(d,"value")},
"atMost":function(d){return "Must be at most "+i18n.v(d,"value")},
"greaterThan":function(d){return "Must be greater than "+i18n.v(d,"value")},
"atLeast":function(d){return "Must be at least "+i18n.v(d,"value")},
"between":function(d){return "Must be between "+i18n.v(d,"a")+" and "+i18n.v(d,"b")},
"empty":function(d){return "Must be empty not \""+i18n.v(d,"value")+"\""},
"notEmpty":function(d){return "Cannot be empty"},
"notNull":function(d){return "Must be provided"},
"lengthOf":function(d){return "Must be exactly "+i18n.p(d,"value",0,"en",{"one":i18n.n(d,"value")+" character","other":i18n.n(d,"value")+" characters"})+" long"},
"lengthAtLeast":function(d){return "Must be at least "+i18n.p(d,"value",0,"en",{"one":i18n.n(d,"value")+" character","other":i18n.n(d,"value")+" characters"})+" long"},
"lengthAtMost":function(d){return "Must be at most "+i18n.p(d,"value",0,"en",{"one":i18n.n(d,"value")+" character","other":i18n.n(d,"value")+" characters"})+" long"},
"oneOf":function(d){return "Must be one of: "+i18n.v(d,"value")},
"numeric":function(d){return "Must be a number"}}
module.exports = i18n;
