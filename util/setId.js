var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

function find (name) { //获取id表
    
    return new Promise ((resolve,reject)=>{
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");
            var whereStr = {name:name} // 查询需要增加的id
            dbo.collection('ids').find(whereStr).toArray(function(err, result) { // 返回集合中所有数据
                if (err) throw err;
                console.log('result---',result)
                resolve (result)
                db.close();
            });
        });
    })
}


async function setId (name) {   
     
    var json = await find(name)
    if(json[0]){
        return new Promise ((resolve,reject)=>{
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("back");
                var whereStr = {name:name} // 查询需要修改的id
                var id = parseInt(json[0].id)+1
                var updateStr = {$set: { id : id }};
                dbo.collection("ids").updateOne(whereStr, updateStr, function(err, res) {
                    if (err) throw err;             
                    db.close();
                    console.log('id',id)
                    resolve(id)
                });
            });
        })
    }else{
        return new Promise ((resolve,reject)=>{
            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                var dbo = db.db("back");
                var id = 0
                var data = { name: name, id: id };
                dbo.collection("ids").insertOne(data, function(err, res) {
                    if (err) throw err;                    
                    db.close();
                    resolve(id)
                });
            });
        })
    }
           
}

module.exports = setId