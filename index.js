for (let i = 0; i < 20; i++) {
    //bot.sendMessage(304622290, `Твой корабль: ${get_info("ship",random.int(0, 19))}`);
    //bot.sendMessage(304622290, `Твоя страна: ${get_info("coun",random.int(0, 9))}`);
    //bot.sendMessage(304622290, `Твой атр: ${get_info("attr",random.int(0, 9))}`);
}
//bot.sendMessage(304622290, "Телеграм бот - запущен");
process.on('uncaughtException', (err) => {
    console.log('Глобальный косяк приложения!!! ', err.stack);
});

const PORT = process.env.PORT || 777;

import express from 'express'
import TelegramBot from 'node-telegram-bot-api'
import mysql from 'mysql2'
import random from 'random'
const app = express();
const token = '6401290616:AAEPoMZejA4tlQFCg7-xf40mMQG4qbucGck';
const bot = new TelegramBot(token, {polling: true});

let sets = {
    host: 'platon.teyhd.ru',
    user: 'platon',
    password : '258000',
    database: 'tgbot',
    charset : 'utf8mb4_general_ci',
    waitForConnections: true,
    connectionLimit: 50,
    maxIdle: 50, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
}
const pool = mysql.createPool(sets).promise()

async function get_user_dgid(tgid){
    const qer = `SELECT dgid from users WHERE tgid=${tgid}`
    const [rows, fields] = await pool.query(qer)
    console.dir(rows.length)
    return rows;
}
async function add_user(tgid){
    const qer = `INSERT INTO users (tgid,dgid,name,ship,coun,attr) VALUES (${tgid},0,${random.int(0, 25)},${random.int(0, 19)},${random.int(0, 19)},${random.int(0, 19)});`
    const [rows, fields] = await pool.query(qer)
    console.dir(rows);
    return rows.insertId;
}


bot.on('message',async (msg) => {
    const chatId = msg.chat.id;
    var userinf = await get_user_dgid(chatId);
    
    if (userinf.length==0) {
        await add_user(chatId)
        userinf = [{dgid:0}]
    } 

    await ans_render(userinf[0],msg)

    console.dir(msg);
    
    bot.sendMessage(304622290, `${msg.chat.id} написал сообщение\n ${msg.text}`);
   
  });

bot.on('callback_query', function (msg) {
console.dir(msg)

});

get_info('coun',2)


function get_info(arrname,id) {
    
    var infos = {
        ship:["Королевская удача","Приключенческая галера","Свобода","Габриэль","Рейнджер","Артемида","Изысканный","Золотая лань","Счастливое приключение","Нью-Йоркская месть","Месть королевы Анны","Робак","Бригантина","Драккар","Галеон","Каравелла","Фрегат","Варшип","Каракка","Шхуна","Корвет"],
        coun:["Норвегия","Португалия","Китай","Великобритания","Италия","Испания","Франция","Голландия","Дания","Чили","Филиппины","Грузия","Россия","Румыния","Турция","Абхазия","Болгария","Сальвадор","Сомали","Шри-Ланка"],
        attr:["Кинжал","Крюк","Счастливый череп","Золото","Флаг","Деревянная нога","Пушка","Сабля","Сундук","Золотые монеты","Бочка","Компас","Бандана","Треуголка","Звездная карта","Попугай","Подзорная труба","Обезьянка","Повязка на глаз","Револьвер"],
        nikss:["Джонс","Джек Воробей","Блэк","Литтл","Уайт","Грин","Рэд","Адамс","Одли","Остин","Бейкер","Байер","Белл","Бенсон","Картер","Кларк","Дэвис","Дин","Роуз","Стюарт","Эдисон","Эванс","Поттер","Фрай","Гиббс","Гилмор","Джексон"]
    }
    //console.log(infos.attr.length);
    
    let ans = ''
    try {
        ans = infos[arrname][id]
    } catch (err) {
        console.log(err);
    }
    return ans
}
async function ans_render(userinf,msg){
    let dialogs = [`Добро пожаловать на борт, Капитан! Я твой верный помощник мистер Ботти и буду помогать тебе во всем! Сегодня тебя ждет захватывающее путешествие в поисках сокровищ! Ты готов выполнить три задания и получить приз, о котором мечтает любой морской волк?`]
    let rkeyboard = [
        [[{text:'Да', callback_data:'1'},{'text':'В путь!',callback_data:'1'}]]
    ]
    var ans = ''
    const opts = {
        reply_to_message_id: msg.message_id,
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            inline_keyboard: rkeyboard[userinf.dgid],
            //      keyboard: [["uno :+1:"],["uno \ud83d\udc4d", "due"],["uno", "due","tre"],["uno", "due","tre","quattro"]]
        
        }
    };
    console.log(userinf);
    console.log(userinf.dgid);
    console.log(dialogs[userinf.dgid]);
    await bot.sendMessage(msg.chat.id, dialogs[userinf.dgid],opts);
}

app.listen(PORT, ()=>{
    console.log('Телеграм запущен порт:', PORT)
})



