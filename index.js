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
    //console.dir(rows.length)
    return rows;
}
async function get_user_info(tgid){
    const qer = `SELECT * from users WHERE tgid=${tgid}`
    const [rows, fields] = await pool.query(qer)
   // console.dir(rows.length)
    return rows;
}
async function get_user_info_by_id(id){
    const qer = `SELECT * from users WHERE id=${id}`
    const [rows, fields] = await pool.query(qer)
    console.dir(rows[0])
    return rows[0];
}
async function get_users_count() {
    const qer = `SELECT count(id) as count FROM users;`
    const [rows, fields] = await pool.query(qer)
    return rows[0].count;
}
async function get_task() {
    let ans = random.int(1, await get_users_count())
    console.log(ans);
    return ans;
}
async function add_user(tgid){
    let qer = `INSERT INTO users (tgid,dgid,name,ship,coun,attr,task) VALUES (${tgid},0,${random.int(0, 25)},${random.int(0, 19)},${random.int(0, 19)},${random.int(0, 19)},${await get_task()});`
    const [rows, fields] = await pool.query(qer);
    console.dir(rows);
    qer = `INSERT INTO tasks (tgid) VALUES (${tgid});`
    const [ans, fans] = await pool.query(qer);
    return rows.insertId;
}

async function set_dgid(dgid,tgid){
    const qer = `UPDATE users SET dgid=${dgid} WHERE tgid=${tgid};`    
    const [rows, fields] = await pool.query(qer)
    return rows;
}

async function mng_ans(tgid,a1=null,a2,a3,ans){
    let qer = `SELECT a1,a2,a3,ans from tasks WHERE tgid=${tgid}`
    if (a1!=null){
        qer = `UPDATE tasks SET a1=${a1},a2=${a2},a3=${a3},ans=${ans} WHERE tgid=${tgid};` 
    }
    const [rows, fields] = await pool.query(qer)
    return rows;
}

async function lives(tgid,lives=null){
    let qer = `SELECT lives from tasks WHERE tgid=${tgid}`
    if (lives!=null){
        qer = `UPDATE tasks SET lives=${lives} WHERE tgid=${tgid};` 
    }
    const [rows, fields] = await pool.query(qer)
    return rows[0]
}

async function set_task(tgid){
    let new_task = await get_task()
    
    if ((await get_user_info_by_id(new_task)).tgid == tgid){
        set_task(tgid)
    }

    const qer = `UPDATE users SET task=${new_task} WHERE tgid=${tgid};`    
    const [rows, fields] = await pool.query(qer)
    return rows;
}
var lastmsg = []

bot.on('message',async (msg) => {
    console.log(msg);
    const chatId = msg.chat.id;
    var userinf = await get_user_info(chatId);
    if (userinf.length==0) {
        await add_user(chatId)
        userinf = [{dgid:0}]
    } 
    switch (msg.text) {
        case "Кто я?":
        case "инфо":
        case "Инфо":
        case "/me":
            let dialogs = `Твое имя: Капитан ${get_info('niks',userinf[0].name)}\nТвой корабль: ${get_info('ship',userinf[0].ship)}\nСтрана: ${get_info('coun',userinf[0].coun)}\nАтрибут: ${get_info('attr',userinf[0].attr)}`
            bot.sendMessage(msg.chat.id, dialogs)
            break;
        case "/start":
            bot.sendMessage(msg.chat.id, "Приятной игры!")
            //bot.sendPhoto(msg.chat.id,"/pic.jpg")
        default:
            await bot.deleteMessage(msg.chat.id,msg.message_id)
            await ans_render(userinf[0],msg)
            break;
    }

  //  console.dir(msg); 
   // bot.sendMessage(304622290, `${msg.chat.id} написал сообщение\n ${msg.text}`);
});

bot.on('callback_query',async (msg) => {
    msg.chat = {id:0}
    msg.chat.id = msg.message.chat.id
    var userinf = await get_user_info(msg.message.chat.id);

    console.log(userinf[0].dgid);
    switch (userinf[0].dgid) {
        case 3:
        case 4:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(4,msg.chat.id)
            } else await set_dgid(5,msg.chat.id)
        break;

        case 6:
        case 7:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(7,msg.chat.id)
            } else await set_dgid(8,msg.chat.id)
        break;

        case 8:
        case 9:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(9,msg.chat.id)
            } else await set_dgid(10,msg.chat.id)
        break;
    
        case 12:
        case 13:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(13,msg.chat.id)
            } else await set_dgid(14,msg.chat.id)
        break;

        case 15:
        case 16:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(16,msg.chat.id)
            } else await set_dgid(17,msg.chat.id)
        break;
        case 18:
        case 19:   
            if (msg.data!=(await mng_ans(msg.chat.id,null))[0].ans){
                await set_dgid(19,msg.chat.id)
            } else await set_dgid(20,msg.chat.id)
        break;
        default:
            await set_dgid(msg.data, msg.message.chat.id)
        break;
    }

    
    userinf = await get_user_info(msg.message.chat.id);
    //console.log(userinf);
    await ans_render(userinf[0],msg)
});

function get_info(arrname,id) {
    
    var infos = {
        ship:["Королевская удача","Приключенческая галера","Свобода","Габриэль","Рейнджер","Артемида","Изысканный","Золотая лань","Счастливое приключение","Нью-Йоркская месть","Месть королевы Анны","Робак","Бригантина","Драккар","Галеон","Каравелла","Фрегат","Варшип","Каракка","Шхуна","Корвет"],
        coun:["Норвегия","Португалия","Китай","Великобритания","Италия","Испания","Франция","Голландия","Дания","Чили","Филиппины","Грузия","Россия","Румыния","Турция","Абхазия","Болгария","Сальвадор","Сомали","Шри-Ланка"],
        attr:["Кинжал","Крюк","Счастливый череп","Золото","Флаг","Деревянная нога","Пушка","Сабля","Сундук","Золотые монеты","Бочка","Компас","Бандана","Треуголка","Звездная карта","Попугай","Подзорная труба","Обезьянка","Повязка на глаз","Револьвер"],
        niks:["Джонс","Джек Воробей","Блэк","Литтл","Уайт","Грин","Рэд","Адамс","Одли","Остин","Бейкер","Байер","Белл","Бенсон","Картер","Кларк","Дэвис","Дин","Роуз","Стюарт","Эдисон","Эванс","Поттер","Фрай","Гиббс","Гилмор","Джексон"]
    }
 
    let ans = ''
    try {
        ans = infos[arrname][id]
    } catch (err) {
        console.log(err);
    }
    return ans
}
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }
async function ans_render(userinf,msg){
    let dialogs = 'Ошибка диалога'
    let rkeyboard = [[]]
    switch (userinf.dgid) {
        case 0:
            dialogs = `Добро пожаловать на борт, Капитан!\nЯ твой верный помощник мистер Ботти!\nСегодня тебя ждет захватывающее путешествие в поисках сокровищ!\nТы готов выполнить три задания и получить приз, о котором мечтает любой морской волк?`
            rkeyboard = [[{text:'Да!', callback_data:'1'},{'text':'В путь!',callback_data:'1'}]] 
        break;
        case 1:
            dialogs = `Отлично!\nОтныне твое имя Капитан *${get_info('niks',userinf.name)}*!\nПеред отправкой запомни кое-что очень важное.\nДругие обитатели морей будут задавать тебе много вопросов,\nа по морсеому кодексу, отвечать нужно только честно,\nиначе морской кракен потопит твой корабль.\n\nВсем всегда интересны три вещи: откуда ты прибыл, какой у тебя корабль и с каким атрибутом ты никогда не расстаешься.\n\nМы прибыли из *${get_info('coun',userinf.coun)}*,\nна корабле *${get_info('ship',userinf.ship)}*,\nа самый главный атрибут капитана нашего корабля - *${get_info('attr',userinf.attr)}*.\n\nЕсли что, я всегда могу напомнить, только попроси меня об этом. Напиши в чат /me \n\nВсе запомнил?`
            rkeyboard = [[{text:'Да!', callback_data:'2'}]]  
        break;
        case 2:
            set_task(userinf.tgid);

            dialogs = `Поднять паруса! В путь!\n\nУра, вижу сушу! Вот и первая точка нашего маршрута - Остров Золотых Песков.\n\nОтдать швартовые!\nЧто ж, капитан *${get_info('niks',userinf.name)}*, карта сокровищ привела нас сюда, но мы тут явно не одни…\nЯ слышал об этом человеке.\nЭто капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*!\n\nЕго знают, как отличного штурмана, у него есть особая чуйка на сокровища, его помощь нам бы пригодилась.\nИнтересно, какой у него корабль?\nСможешь узнать?`
            rkeyboard = [[{text:'Сейчас узнаю!', callback_data:'3'}]]  
        break;
        case 3:
            console.log(await mng_ans(userinf.tgid,null));

            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).ship)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №1: Узнай какой корабль у Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\nНайди его скорее и напиши мне ответ.\nУ тебя есть только две попытки!\n\n\n*${get_info('ship',(await get_user_info_by_id(userinf.task)).ship)}*`
            rkeyboard = [[{text:get_info('ship',ship[0]), callback_data:ship[0]},{text:get_info('ship',ship[1]),callback_data:ship[1]}],[{text:get_info('ship',ship[2]), callback_data:ship[2]},{text:get_info('ship',ship[3]),callback_data:ship[3]}]] 
        break;
        case 4:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай какой корабль у Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('ship',ship[0]), callback_data:ship[0]},{text:get_info('ship',ship[1]),callback_data:ship[1]}],[{text:get_info('ship',ship[2]), callback_data:ship[2]},{text:get_info('ship',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(2, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я вижу еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:2}]] 
            }
        break;
        case 5:
            lives(userinf.tgid,2)
            dialogs = `Этот остров не принес нам долгожданных сокровищ, но зато Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}* подсказал нам, куда надо двигаться дальше за следующей подсказкой.\n\nСледуем на Облачный Мыс! Как быстро мы оказались на месте.\n\nО, а мы тут снова не одни.\nЕсть легенда, что для того, чтобы узнать подсказку, нужно поздороваться с Хранителем Облачного Мыса на нескольких языках.\n\nДавай узнаем у капитанов, откуда они и все вместе скажем "Привет"!`
            rkeyboard = [[{text:'Отлично!', callback_data:6}]]
            break;
        case 61:
            dialogs = `Я нашел Капитана`
            rkeyboard = [[{text:'Дай его контакты!', callback_data:6}]] 
        break;
        case 6:
            set_task(userinf.tgid);
            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).coun)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №2: Узнай из какой страны прибыл Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\n\nУ тебя есть только две попытки!\n\n\n*${get_info('coun',(await get_user_info_by_id(userinf.task)).coun)}*`
            rkeyboard = [[{text:get_info('coun',ship[0]), callback_data:ship[0]},{text:get_info('coun',ship[1]),callback_data:ship[1]}],[{text:get_info('coun',ship[2]), callback_data:ship[2]},{text:get_info('coun',ship[3]),callback_data:ship[3]}]] 
            break;
        case 7:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай из какой страны Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('coun',ship[0]), callback_data:ship[0]},{text:get_info('coun',ship[1]),callback_data:ship[1]}],[{text:get_info('coun',ship[2]), callback_data:ship[2]},{text:get_info('coun',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(61, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я нашел еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:61}]] 
            }
            break;
        case 8:
            set_task(userinf.tgid);
            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).coun)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №3: А теперь узнай из какой страны прибыл Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\n\nУ тебя есть только две попытки!\n\n\n*${get_info('coun',(await get_user_info_by_id(userinf.task)).coun)}*`
            rkeyboard = [[{text:get_info('coun',ship[0]), callback_data:ship[0]},{text:get_info('coun',ship[1]),callback_data:ship[1]}],[{text:get_info('coun',ship[2]), callback_data:ship[2]},{text:get_info('coun',ship[3]),callback_data:ship[3]}]] 
            break;
        case 81:
            dialogs = `Я нашел Капитана`
            rkeyboard = [[{text:'Дай его контакты!', callback_data:8}]] 
        break;       
        case 9:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай из какой страны Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('coun',ship[0]), callback_data:ship[0]},{text:get_info('coun',ship[1]),callback_data:ship[1]}],[{text:get_info('coun',ship[2]), callback_data:ship[2]},{text:get_info('coun',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(81, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я нашел еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:81}]] 
            }
        break;

        case 10:
            dialogs = `Ура!\n\nТеперь мы можем пройти в пещеру.\nБлагодаря нашим новым спутникам Хранитель Пещеры впустил нас.\n\nА вот и следующая подсказка координаты долгожданного Острова Сокровищ!`
            rkeyboard = [[{text:'Поднять паруса!', callback_data:11}]] 
        break;
        case 11:
            dialogs = `Вот мы и на месте.\nИ снова мы тут не одни… Думаю, нам нужно объединиться, чтобы достичь цели.\n\nСмотри, там табличка: "Чтобы получить сокровище, нужно положить на этот камень то, с чем вы никогда не расстаетесь и тогда сокровище будет ваше!\n\nСокровища получат четверо смельчаков!`
            rkeyboard = [[{text:'Получить задачу!', callback_data:12}]] 
        break;
        case 12:
            set_task(userinf.tgid);
            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).attr)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №4: Хм… Что ж, значит нам нужно найти еще трех Капитанов у которых есть что-то, с чем они не расстаются никогда…\n\nСпросишь у Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\n\nУ тебя есть только две попытки!\n\n\n*${get_info('attr',(await get_user_info_by_id(userinf.task)).attr)}*`
            rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            break;
        case 121:
            dialogs = `Я нашел Капитана`
            rkeyboard = [[{text:'Дай его контакты!', callback_data:12}]] 
        break;    
        case 13:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай незаменимый аттрибут Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(121, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я нашел еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:121}]] 
            }
        break;
        case 14:
            dialogs = `Отлично, один есть!`
            rkeyboard = [[{text:'Найти следующего!', callback_data:15}]]
        break;
        case 15:
            set_task(userinf.tgid);
            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).attr)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №5: Я вижу Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\nCпросишь теперь у него?\n\nУ тебя есть только две попытки!\n\n\n*${get_info('attr',(await get_user_info_by_id(userinf.task)).attr)}*`
            rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            break;
        case 151:
            dialogs = `Я нашел нового Капитана`
            rkeyboard = [[{text:'Поделись контактом!', callback_data:15}]] 
        break; 
        case 16:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай незаменимый аттрибут Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(151, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я нашел еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:151}]] 
            }
        break;        
        case 17:
            dialogs = `Осталось последнее задание!`
            rkeyboard = [[{text:'Приступить!', callback_data:18}]] 
        break;
        case 18:
            set_task(userinf.tgid);
            var ship = get_unic_arr((await get_user_info_by_id(userinf.task)).attr)
            await mng_ans(userinf.tgid,ship[1],ship[2],ship[3],ship[0])
            ship = shuffle(ship)
            ship = shuffle(ship)
            
            console.log(ship);
            dialogs = `Задание №6: О, мой добрый друг Капитан *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.\nОн точно ответит и мы получим сокровища!\n\nУ тебя есть только две попытки!\n\n\n*${get_info('attr',(await get_user_info_by_id(userinf.task)).attr)}*`
            rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            break;
        case 181:
            dialogs = `Я нашел Капитана`
            rkeyboard = [[{text:'Дай его контакты!', callback_data:18}]] 
        break; 
        case 19:
            var anses = (await mng_ans(userinf.tgid,null))[0]
            var ship = [anses['a1'],anses['a2'],anses['a3'],anses['ans']]
            ship = shuffle(ship)
            ship = shuffle(ship)
            if ((await lives(userinf.tgid,null)).lives>0){
                var nli = (await lives(userinf.tgid,null)).lives -1
                await lives(userinf.tgid,nli)
                dialogs = `К сожалению, ты ошибся!\n\nОсталось попыток: ${(await lives(userinf.tgid,null)).lives}\n\nУзнай незаменимый аттрибут Капитана *${get_info('niks',(await get_user_info_by_id(userinf.task)).name)}*.`
                rkeyboard = [[{text:get_info('attr',ship[0]), callback_data:ship[0]},{text:get_info('attr',ship[1]),callback_data:ship[1]}],[{text:get_info('attr',ship[2]), callback_data:ship[2]},{text:get_info('attr',ship[3]),callback_data:ship[3]}]] 
            } else {
                set_task(userinf.tgid);
                set_dgid(181, userinf.tgid)
                lives(userinf.tgid,2)
                dialogs = `К сожалению, это тоже не верно. Видимо, тебе попался несговорчивый Капитан. Но ничего, я нашел еще одного!`
                rkeyboard = [[{text:'Узнаю у него!', callback_data:181}]] 
            }
        break; 
        case 20:
            dialogs = `Смотри, Капитан!\nВон там появилась шкатулка, открывай ее скорее!\nНаши долгожданные сокровища!`
            rkeyboard = [[{text:'Получить монетку!', callback_data:21}]] 
            break
        case 21:
            dialogs = `Не может быть!\nЭто она!\n\nСамый древний артефакт, который ищут все!\nЯ думал, это просто легенда… но она у тебя в руках…\nСчастливая Монета Платоникс!\n\nОна приносит удачу и помогает обрести невероятные знания… Поздравляю, Капитан!  `
            rkeyboard = [[{text:'Получить монетку!', callback_data:22}]] 
            break; 
        case 22:
            dialogs = `Покажи это сообщение администратору Ольге и ты получишь свою первую монетку в этом учебном году!\n\nА наставники расскажут подробнее, для чего они нужны\n\nСпасибо за игру!!!`
            break;
        default:
            break;
    }
    
    const opts = {
      
        reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
           // keyboard: [["Кто я?"]],
            inline_keyboard: rkeyboard
            //keyboard: [["uno :+1:"],["uno \ud83d\udc4d", "due"],["uno", "due","tre"],["uno", "due","tre","quattro"]]
        },
        parse_mode: 'Markdown'
    };

    console.log(1111111);
    console.log(lastmsg[msg.chat.id]);
    try {
        if (lastmsg[msg.chat.id]!=undefined) await bot.deleteMessage(msg.chat.id,lastmsg[msg.chat.id])
    } catch (error) {
        console.log(error);
    }
    
    let test = await bot.sendMessage(msg.chat.id, dialogs, opts);
    lastmsg[msg.chat.id] = test.message_id
}

function get_unic_arr(key){
    let arr = [key,random.int(0, 19),random.int(0, 19),random.int(0, 19)];
    const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
    const duplicates = findDuplicates(arr);
    console.log(arr);
    console.log(duplicates);
    if (duplicates.length==0) {
        return arr
    } else return get_unic_arr(key)
}

app.listen(PORT, ()=>{
    console.log('Телеграм запущен порт:', PORT)
})
