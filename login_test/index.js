const express = require('express');
const mysql = require('mysql');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser'); 

// express 설정
const app = express();

// db 연결
const client = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : 'password',
    database : 'login_test'
});

// 정적 파일 설정 (미들웨어)
app.use(express.static(path.join(__dirname,'/public')));

// ejs 설정
app.set('views', __dirname + '\\views');
app.set('view engine','ejs');

// 정제 (미들웨어)
app.use(bodyParser.urlencoded({extended:false}));

// 세션 (미들웨어)
app.use(session({
    secret: 'blackzat', // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    store : new FileStore() // 세션이 데이터를 저장하는 곳
}));

app.use('/public', express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
app.use(cors()); // 모든 도메인에서 제한 없이 해당 서버에 요청을 보내고 응답을 받을 수 있다.

// 메인페이지
app.get('/',(req,res)=>{
    console.log('메인페이지 작동');
    console.log(req.session);
    if(req.session.is_logined == true){
        res.render('home/index',{
            is_logined : req.session.is_logined,
            name : req.session.name
        });
    }else{
        res.render('home/index',{
            is_logined : false
        });
    }
});

// 회원가입
app.get('/register',(req,res)=>{
    console.log('회원가입 페이지');
    res.render('home/register');
});

app.post('/register',(req,res)=>{
    console.log('회원가입 하는중')
    const body = req.body;
    const id = body.id;
    const password = body.pw;
    const name = body.name;
    const email = body.email;

    client.query('select * from user_information where id=?',[id],(err,data)=>{
        if(data.length == 0){
            console.log('회원가입 성공');
            res.send('<script>alert("회원가입에 성공하였습니다.");</script>');
            client.query('insert into user_information(id, name, password, email) values(?,?,?,?)',[
                id, name, password, email
            ]);
            res.send('<script>alert("회원가입에 성공하였습니다.");</script>');
            res.redirect('/');
        }else{
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입에 실패하였습니다.");</script>');
            res.redirect('/login');
        }
    });
});

// 로그인
app.get('/login',(req,res)=>{
    console.log('로그인 작동');
    res.render('home/login');
});

app.post('/login',(req,res)=>{
    const body = req.body;
    const id = body.id;
    const password = body.pw;

    client.query('select * from user_information where id=?',[id],(err,data)=>{
        // 로그인 확인
        console.log(data[0]);
        console.log(id);
        console.log(data[0].id);
        console.log(data[0].password);
        console.log(id == data[0].id);
        console.log(pw == data[0].password);
        if(id == data[0].id || pw == data[0].password){
            console.log('로그인 성공');
            res.send('<script>alert("로그인에 성공하였습니다.");</script>');
            // 세션에 추가
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.password;
            req.session.save(function(){ // 세션 스토어에 적용하는 작업
                res.render('index',{ // 정보전달
                    name : data[0].name,
                    id : data[0].id,
                    email : data[0].email,
                    is_logined : true
                });
            });
            res.render('home/index');
        }else{
            console.log('로그인 실패');
            res.send('<script>alert("로그인에 실패하였습니다.");</script>');
            res.render('login');
        }
    });
    
});

// 로그아웃
app.get('/logout',(req,res)=>{
    console.log('로그아웃 성공');
    req.session.destroy(function(err){
        // 세션 파괴후 할 것들
        res.redirect('/');
    });

});

app.listen(4000, ()=>{
    console.log("server listening 4000");
})