const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const app = express();

const listItems = [];
const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Darkrider:4IoP6MV5Dat8yM4Z@cluster0.txbnu60.mongodb.net/todolistdb',{useNewUrlParser: true});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({name: "Welcome to your todolist!"});

// const item2 = new Item({name: "Hit the + button to a item"});

// const item3 = new Item({name:"<-- hit this to delete an item"});

const defaultItem = [item1];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({},(err,foundItems)=>{
    if(foundItems.length===0){
      Item.insertMany(defaultItem, (err)=>{
        if(err) console.log(err);
        else console.log("Successfully saved default items to DB");
      });   
      res.redirect("/");   
    }
    else{    
      res.render("list", {
        listTitle: "Today",
        listItems: foundItems
      });
    }
  })
  
});


app.get("/work", function(req, res){
  res.render("list", {
    listTitle: "Work List",
    listItems: workItems});
});

app.get("/:customListName", (req, res)=>{
  const customListName = req.params.customListName;
  List.findOne({name: customListName},(err,foundList)=>{
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items:defaultItem
        });
        list.save();
        res.redirect("/"+customListName);
      }  
      else{
        res.render("list", {
          listTitle: foundList.name,
          listItems: foundList.items
        });
      }
    }
  });
 
});

app.post("/", function(req, res){
  const itemName = req.body.newTodo;
  const listName = req.body.list;

  console.log(itemName);
    const item = new Item({name:itemName});
    if(listName === "Today"){
      item.save();
      res.redirect("/");
    }
    else{
      List.findOne({name:listName},(err,foundList)=>{
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
      });
    }
    
});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  Item.findByIdAndRemove(checkedItemId,(err,docs)=>{
    if (err){
      console.log(err);
    }
    else{
        console.log("Deleted : ", docs);
    }

    res.redirect("/"); 
  });
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server running on port 3000.");
});




