// require mongoose
var mongoose = require('mongoose');
// create a schema class
var Schema = mongoose.Schema;

// create the Input schema
var InputSchema = new Schema({
  title: {
    type:String
  },
  body: {
    type:String
  }
});

// create the Input model with the InputSchema
var Input = mongoose.model('Input', InputSchema);

// export the Input model
module.exports = Input;