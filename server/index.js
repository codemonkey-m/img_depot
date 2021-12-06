const fs = require('fs')
const http = require('http')
const event = require("events")
const cfg = require('../assets/js/cfg.js')

http_event = new event()

try {
    let check = [
        'images',
        'images/full',
        'images/thumb',
    ]

    for (let dir of check) {
        fs.exists(dir, function (exists) {
            if (!exists) {
                fs.mkdirSync(dir)
            }
        })
    }
} catch (e) { }

try {
    let type = cfg.url.match(/:(\d+)\//)
    if (type == null)
        return

    http.createServer(http_recv).listen(type[1])
} catch (e) {
    console.log(e.message)
}

function http_recv(req, res) {

    res.send = function (msg, code = 200) {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('P3P', 'CP=CAO PSA OUR')
        res.writeHead(code)
        res.write(JSON.stringify(msg))
        res.end()
    }

    let post_data = ''
    req.on('data', (chunk) => {
        post_data += chunk
    })

    req.on('end', () => {
        let type = req.url.match(/\/(\w+?)\?/)
        if (type == null)
            return

        console.log(type)
        http_event.emit(type[1], req, res, post_data)
    })
}

http_event.on('imgs', function (req, res) {
    let dir = fs.readdirSync("./images/thumb")
    console.log(dir)
    res.send(dir)
})

function check_token(token, callback) {
    function result(c, m) {
        return callback({ msg: m, code: c })
    }

    fs.readFile('./token', 'utf8', (err, data) => {
        if (err) {
            fs.writeFile('./token', token, err => {
                return result(1, "token创建成功")
            })
        } else {
            if (data == token)
                return result(1)
            else
                return result(0, "token验证失败")
        }
    })
}

http_event.on('check', function (req, res) {
    let param = get_url_param(req.url)
    check_token(param.ut, (r) => {
        res.send(r)
    })
})

http_event.on('upload', function (req, res, post) {
    let param = get_url_param(req.url)
    check_token(param.ut, (r) => {
        if (r.code == 0)
            return res.send(r)

        param = get_url_param(decodeURIComponent(post))

        let reg = new RegExp('data:image\/(.*);base64')
        let tick = new Date().getTime()

        let full_info = param.img.match(reg)
        let thumb_info = param.thumb.match(reg)

        //按原始文件格式保存
        fs.writeFile(`./images/thumb/${tick}.${full_info[1]}`, Buffer.from(param.thumb.replace(thumb_info[0], ''), 'base64'), err => {
        })

        fs.writeFile(`./images/full/${tick}.${full_info[1]}`, Buffer.from(param.img.replace(full_info[0], ''), 'base64'), err => {
            return res.send({ msg: "上传完成", code: 1 })
        })
    })
})

function get_url_param(url) {
    try {
        let param = url.match(/\?([^#]+)/)
        if (param == null || param.length < 2)
            param = url
        else
            param = param[1]

        let obj = {},
            arr = param.split('&')
        for (let i = 0; i < arr.length; i++) {
            let subArr = arr[i].split('=')
            obj[subArr[0]] = subArr[1]
        }
        return obj

    } catch (err) {
        this.err(err.message)
        return {}
    }
}