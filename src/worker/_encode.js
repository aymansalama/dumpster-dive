// mongo has some opinions about what characters are allowed as keys and ids.
//https://stackoverflow.com/questions/12397118/mongodb-dot-in-key-name/30254815#30254815
const specialChar = /[\\\.$]/;

const encodeStr = function(str) {
  if (typeof str !== 'string') {
    str = '';
  }
  return str
    .replace(/\\/g, '\\\\')
    .replace(/^\$/, '\\u0024')
    .replace(/\./g, '\\u002e');
};

const encodeObj = function(obj) {
  let keys = Object.keys(obj);
  for(let i = 0; i < keys.length; i += 1) {
    if (specialChar.test(keys[i]) === true) {
      let str = encodeStr(keys[i]);
      if (str !== keys[i]) {
        obj[str] = obj[keys[i]];
        delete obj[keys[i]];
      }
    }
  }
  return obj;
};

//tables & infoboxes & citations could potentially have unsafe keys
const encodeData = function(data) {
  data = data || {};
  //cleanup forbidden object key names in mongo
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(o => {
      //encode keys in templates
      if (o.templates) {
        o.templates = o.templates.map(tmpl => {
          tmpl = encodeObj(tmpl);
          //infoboxes have their stuff here
          if (tmpl.data) {
            tmpl.data = encodeObj(tmpl.data);
          }
          return tmpl;
        });
      }
      //encode keys in tables
      if (o.tables && o.tables.length > 0) {
        o.tables = o.tables.map(table => {
          return table.map((row) => encodeObj(row));
        });
      }
    });
  }
  return data;
};

module.exports = {
  encodeData: encodeData,
  encodeStr: encodeStr
};
