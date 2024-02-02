import express  from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import axios from "axios";


const app = express();
const port = 5000;


app.set("view engine" , "ejs")

app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"));


mongoose.connect("mongodb://127.0.0.1/internDB");


const detailSchema = new mongoose.Schema({
    items : Object
})

const Detail = mongoose.model("Detail" , detailSchema)


const baseURL = "http://localhost:5000";
const response = async ()=>{

    const fetchedData = await axios.get(baseURL + "/units");
    const result = fetchedData.data;
    console.log(result);
    return result;
}

console.log(response)


app.get("/" , async (req,res)=>{
    const response = await axios.get("https://api.wazirx.com/api/v2/tickers")
    const obj = response.data;
    var list  = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            var subList = {
                name : obj[key].name,
                last : obj[key].last,
                buy : obj[key].buy,
                sell : obj[key].sell,
                volume : obj[key].volume,
                base_unit : obj[key].base_unit
            }
          list.push(subList);
          
        }
    }



    const item1 = new Detail({
        items : list.slice(0 , 10)
    })
    

    // Detail.deleteMany().then(()=>{
    //     console.log("old data deleted");
    // })
    
    Detail.find().then((foundItems)=>{
        if(foundItems.length === 0){

            item1.save().then(()=>{
                console.log("inserted new items")
                res.json(foundItems)

            })
        } else {
            Detail.findByIdAndUpdate(foundItems._id , {items : item1}).then((items , err)=>{
                if(!err){
                    console.log("updated")
                }
            })
        }

        Detail.find().then((foundItems)=>{
            res.json(foundItems);
        })
        
    })
    
})


app.get("/units" , (req,res)=>{
    var units = []
    Detail.find().then((foundItems)=>{
        foundItems[0].items.map((item)=>{
            units.push(item.name)
            
        })
        console.log(units)
        
        res.json(units);

    })


})

app.listen(port , (req,res)=>{
    console.log(`server is running on port ${port}`)
})