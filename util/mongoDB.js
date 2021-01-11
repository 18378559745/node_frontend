var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const {formatTime,setData} = require( './util')
const upload = require('./multer.js')
const setId = require('./setId.js')
var list={
    code:200,
    data:[],
}  
var dbSet = {
    find:function (tabName,data,cab) {
        MongoClient.connect(url, { useNewUrlParser: true }, async function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");
            if(data!==null){
                let page = {
                    page:data.page,
                    page_size:data.page_size
                }
                delete data.page
                delete data.page_size     
                dbSet.find(tabName,null,(t_db,table)=>{ //获取总条数
                    console.log('table',table.data.length)
                    list.total = table.data.length
                    dbo.collection(tabName)
                        .find(data)
                        .skip((Number(page.page)-1)*page.page_size)
                        .limit(Number(page.page_size))
                        .toArray(function(err, result) { // 返回集合中所有数据
                            if (err) throw err;
                            list.data =  result                            
                            cab(db,list)
                        });    
                })
            }else{
                dbo.collection(tabName).find(data).toArray(function(err, result) { // 返回集合中所有数据
                    if (err) throw err;
                    list.data =  result
                    cab(db,list)
                });
            }
            
        });
    },
    insertOne:function (tabName,data,cab) {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");            
            dbo.collection(tabName).insertOne(data, function(err) {
                if (err) throw err;
                list.data = true
                cab(db,list)
            });
        });
    },
    deleteOne:function (tabName,data,cab) {
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");
            dbo.collection(tabName).deleteOne(data, function(err) {
                if (err) throw err;
                list.data = true
                cab(db,list)
            });
          });
    },
    updateOne:function(tabName,data,key,cab){
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");
            var whereStr = {}  // 查询条件
            whereStr[key] = parseInt(data[key])
            delete data.id
            
            console.log('whereStr',whereStr)
            console.log('data',data)
            dbo.collection(tabName).updateOne(whereStr,{$set: data}, function(err) {
                if (err) throw err;
                list.data = true
                cab(db,list)
            });
        });
    }
}

function find (app,src,tabName) {
    app.post(src, async function (req, res) {
        let body = req.body
        console.log('body',body)
        let json = {
            name:body.name,
            age:body.age,     
            page:body.page,
            page_size:body.page_size           
        }
        let data = await setData(json)
        dbSet.find(tabName,JSON.stringify(data) == '{}'?null:data,function(db,result){
            res.status(200)
            res.json(result)
            db.close();
        })
        
    })
}

function insertOne (app,src,tabName) {
    app.post(src, async function (req, res) {
        var data = req.body       
        data.create_timer = formatTime()
        var addId = await setId(tabName)
        data.id = addId
        dbSet.insertOne(tabName,data,function(db,result){
            res.status(200)
            res.json(result)
            db.close()
        })
    })  
}


function uploadImg (app,src,tabName) {
    
    // muilter.single('file'), //适用于单文件上传
    // muilter.array(‘file’,num), //适用于多文件上传，num为最多上传个数，上传文件的数量可以小于num,
    // muilter.fields(fields), //适用于混合上传，比如A类文件1个，B类文件2个
    app.post(src,  upload.single('file'), async function (req, res, next) {
        // req.file is the `avatar` file
        // req.body will hold the text fields, if there were any
        var data = req.body
        var file = req.file
        console.log('-----------data-------')
        console.log(data)
        console.log('----------------file---------')
        console.log(file)
        var data = req.body        
        var addId = await setId(tabName)
        data.id = addId
        data.fileName = file.originalname
        data.path = '/uploadImg/'+file.filename
        dbSet.insertOne(tabName,data,function(db,result){
            res.status(200)
            res.json(result)
            db.close()
        })
      })
}

function updateOne (app,src,searchKey,tabName) {
    app.post(src,  upload.single('file'), async function (req, res, next) {
        var data = req.body
        var file = req.file
        if(file){
            data.fileName = file.originalname
            data.path = '/uploadImg/'+file.filename
        }
        delete data.file 
        dbSet.updateOne(tabName,data,searchKey,function(db,result){
            res.status(200)
            res.json(result)
            db.close()
        })
      })
}

function deleteOne (app,src,tabName) {
    app.post(src,function (req, res) {
        var body = req.body
        var data = {id:parseInt(body.id)};  // 查询条件
        // var data = {id:body.id};  // 查询条件
        dbSet.deleteOne(tabName,data,function(db,result){
            res.status(200)
            res.json(result)
            db.close();
        })
    }) 
}

function login (app,src,tabName) {
    app.post(src,function (req, res) {
        var body = req.body
        var data = {user:body.user,password:body.password};  // 查询条件
        MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
            if (err) throw err;
            var dbo = db.db("back");
            
            dbo.collection(tabName).find(data).toArray(function(err,result) {
                if (err) throw err;
                list.data = result.length > 0 ? result : '用户名或密码错误！'
                list.code = result.length > 0 ? 200 : 400
                if(result.length > 0) {
                    res.cookie('back&cookie', '1', { expires: new Date(Date.now() + ( 3600000 * 2)), httpOnly: true })
                    console.log('设置cookie name成功')
                }
                res.status(200)
                res.json(list)
                db.close();

            });
          });
    }) 

}
module.exports = {
    find:find,
    insertOne:insertOne,
    deleteOne:deleteOne,
    uploadImg:uploadImg,
    updateOne,
    login:login
};
