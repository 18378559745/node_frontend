function formatTime () {
    const date = new Date();
    const Y = date.getFullYear();
    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    const D = (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    const h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
    const m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
    const s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
    // return Y + '年' + M + '月' + D + '日'
    return Y + '-' + M + '-' + D + ' ' + h + m + s
}

function setData (json) {
    return new Promise ((resolve,reject)=>{
        let data = {}
        for(var i in json){
            if(json[i] || json[i] === 0){
                data[i] = json[i]
            }
        }    
        resolve(data)
    })
}


module.exports = {
    formatTime,
    setData,
};

