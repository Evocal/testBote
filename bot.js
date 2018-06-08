//Variables necesarias

var PropertiesReader = require('properties-reader'); //Para crear un properties reader y quitar el token de la aplicacion principal
var Discord = require('discord.js'); //Necesario para usar api de discord
var bot = new Discord.Client(); //Necesario para la escucha del cliente.

var fs = require("fs"); //Lectura de ficheros
var data; // Lectura JSON

try {
    data = require('./data.json');
} catch (err) {
    console.log(err);
    data = {};
}

var banish; // Lectura JSON

try {
    banish = require('./banish.json');
} catch (err) {
    console.log(err);
    data = {};
}

const token = properties.get('token'); //Obtenemos la variable token de properties

//Variables compuestas

var prototipo = {
    autor: '0',
    titulo: '0',
    info: 'Something something'
};

var prototipoBanish = {
    autor: '0',
    target: '0'
};

//Tratamiento de mensajes

bot.on('message', message => {
    //Detect banish

    var autor = message.author.id;

    if (banish[autor]) {
        message.delete();
    }

    //Dice quien es

    if (message.content === '!who are you') {
        message.channel.send("SALUTATIONS! My name is Penny Bot, a recreation of " +
                "Penny Polendina, and I am a test bot where my creator @Evocal#8259 " +
                "test new and amazing stuff!");
    }

    //YAY

    if (message.content === '!good job') {
        message.channel.send("https://i.imgur.com/IFytnDn.gif");
    }

    //Mostrar Avatar

    if (message.content.startsWith('!avatar')) {
        let user = null;
        user = message.mentions.users.first();

        if (user == null) {
            message.channel.send("Error: No has mencionado a nadie");
            return;
        }

        message.channel.send(user.avatarURL);
    }
    //Monstrar UID

    if (message.content.startsWith('!uid')) {

        message.channel.send(message.author.id);
    }

    //Purga de mensajes

    if (message.content.startsWith('!purge')) {
        var content = message.content.split(" ");
        if (content.length < 2) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !purge <cantidad>");
            return;
        } else {
            if (message.author.id != 224571309420445698) {  //No tocar
                message.channel.send('No tienes privilegios');
                return;
            }

            if (isNaN(content[1])) {
                message.channel.send('Error de formato: Segundo argumento no es un numero');
                message.channel.send("Formato: !purge <cantidad>");
                return;
            }

            var cantidad = parseInt(content[1]);

            if (cantidad <= 0) {
                message.channel.send('Error de formato: Segundo argumento debe ser mayor de 0');
                message.channel.send("Formato: !purge <cantidad>");
                return;
            }
            message.channel.bulkDelete(cantidad + 1);
            message.channel.send("Eliminados " + cantidad + " mensajes.");
        }
    }

    //Random Funct

    if (message.content.startsWith('!random')) {
        var content = message.content.split(" ");

        if (content.length < 3) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !random <Limite Inf> <Limite Sup>");
            return;
        }
        var x = parseInt(content[1]);
        var y = parseInt(content[2]);

        if (x >= y) {
            message.channel.send("Error de formato: Primer argumento debe ser menor que el segundo");
            message.channel.send("Formato: !random <Limite Inf> <Limite Sup>");
            return;
        }

        if (isNaN(content[1]) || isNaN(content[2])) {
            message.channel.send("Error de formato: Uno de los argumentos especificados no es un numero");
            message.channel.send("Formato: !random <Limite Inf> <Limite Sup>");
            return;
        }

        if (x < 0 || y < 0) {
            message.channel.send("Error de formato: Uno de los argumentos especificados es menor que 0");
            message.channel.send("Formato: !random <Limite Inf> <Limite Sup>");
            return;
        }
        message.channel.send("Random entre " + x + " y " + y + ".");
        message.channel.send(Math.floor(Math.random() * ((y - x) + 1) + (x)));
    }

    //Crear etiqueta

    if (message.content.startsWith('!write')) {
        var content = message.content.split(" ");

        if (content.length < 3) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !write <titulo> <texto>");
            return;
        }
        var infoText = message.content.substring(content[0].length + content[1].length + 2);
        var state = añadirEtiqueta(message.author.id, content[1], infoText);


        if (state === -1) {
            message.channel.send("Error: El titulo especificado ya existe");
            return;
        } else {
            message.channel.send("Etiqueta: " + content[1] + " con el texto: " + infoText + " ha sido creado.");
            guardarInfo()
        }

    }

    //Leer etiqueta

    if (message.content.startsWith('!read')) {
        var content = message.content.split(" ");

        if (content.length < 2) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !read <titulo>");
            return;
        }

        var state = leerEtiqueta(content[1]);

        if (state === -1) {
            message.channel.send("Error: No existe etiqueta con el titulo especificado");
            return;
        } else if (state === 0) {
            message.channel.send(data[content[1]].info);
            guardarInfo()
        }
    }

    //Borrar etiqueta

    if (message.content.startsWith('!delete')) {
        var content = message.content.split(" ");

        if (content.length < 2) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !delete <titulo>");
            return;
        }

        var state = borrarEtiqueta(message.author.id, content[1]);

        if (state === -1) {
            message.channel.send("Error: No existe etiqueta con el titulo especificado");
            return;
        } else if (state === -2) {
            message.channel.send("Error: No puedes borrar la etiqueta si no eres el dueño");
            return;
        } else {
            delete data[content[1]];
            message.channel.send("Etiqueta " + content[1] + " borrada.");
            guardarInfo();
        }

    }

    //Editar etiqueta

    if (message.content.startsWith('!edit')) {
        var content = message.content.split(" ");

        if (content.length < 3) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !edit <titulo> <contenido>");
            return;
        }

        var infoText = message.content.substring(content[0].length + content[1].length + 2);
        var state = editarEtiqueta(message.author.id, content[1], infoText);

        if (state === -1) {
            message.channel.send("Error: No puedes editar la etiqueta si no eres el dueño");
            return;
        } else if (state === -2) {
            message.channel.send("Error: No existe etiqueta con el titulo especificado");
            return;
        } else {
            data[content[1]].info = infoText;
            message.channel.send("Contenido de etiqueta " + content[1] + " modificado a " + infoText);
            guardarInfo();
        }

    }

    //Copiar etiqueta

    if (message.content.startsWith('!copy')) {
        var content = message.content.split(" ");

        if (content.length < 3) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !edit <titulo a copiar> <nuevo titulo>");
            return;
        }

        var state = copiarEtiqueta(message.author.id, content[1], content[2]);

        if (state === -1) {
            message.channel.send("Error: No puedes copiar la etiqueta si no eres el dueño");
            return;
        } else if (state === -2) {
            message.channel.send("Error: No existe etiqueta con el titulo especificado");
            return;
        } else if (state === -3) {
            message.channel.send("Error: El nuevo nombre de etiqueta ya existe");
            return;
        } else {
            var str = data[content[1]].info;
            data[content[2]] = {
                autor: message.author.id,
                titulo: content[2],
                info: str
            };
            message.channel.send("Contenido de etiqueta " + content[1] + " copiado a " + content[2]);
            delete data[content[1]];
            message.channel.send("Etiqueta " + content[1] + " eliminada.");
            guardarInfo();
        }

    }

    //Target bat

    if (message.content.startsWith('!banish')) {
        var content = message.content.split(" ");

        if (content.length < 2) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !banish <usuario>");
            return;
        }

        if (message.author.id != 224571309420445698) { //No tocar
            message.channel.send("Error: No tienes los privilegios para usar este comando");
            return;
        }

        let user = null;
        user = message.mentions.users.first();

        if (user == null) {
            message.channel.send("Error: No has mencionado a nadie");
            return;
        }

        banish[user.id] = {
            autor: message.author.id,
        };

        message.delete();
        message.author.sendMessage("El usuario " + user + " ha sido targeteado para borrar sus mensajes.");
        guardarBInfo();
    }

    //Desbanear

    if (message.content.startsWith('!unbanish')) {
        var content = message.content.split(" ");

        if (content.length < 2) {
            message.channel.send("Error de formato: Insuficiente numero de argumentos");
            message.channel.send("Formato: !banish <usuario>");
            return;
        }

        if (message.author.id != 224571309420445698) { //No tocar
            message.channel.send("Error: No tienes los privilegios para usar este comando");
            return;
        }

        let user = null;
        user = message.mentions.users.first();

        if (user == null) {
            message.channel.send("Error: No has mencionado a nadie");
            return;
        }

        delete banish[user.id];

        message.delete();
        message.author.sendMessage("El usuario " + user + " ha sido desbaneado");
        guardarBInfo();
    }
});

//Event listener de cuando gente se une al server

bot.on('guildMemberAdd', member => {
    member.sendMessage("Bienvenido! Para obtener acceso completo al servidor pide a un admin que te de el rango 'Member'.");
});

//Funcion de "write

function añadirEtiqueta(idAutor, Titulo, texto) {
    if (data[Titulo]) {
        return -1;
    } else {
        data[Titulo] = {
            autor: idAutor,
            titulo: Titulo,
            info: texto
        };
        guardarInfo();
        return 1;
    }
}

//Guardado de info

function guardarInfo() {
    fs.writeFile('data.json', JSON.stringify(data), "utf8");
}

//Guardado de info(banish)

function guardarBInfo() {
    fs.writeFile('banish.json', JSON.stringify(banish), "utf8");
}

//Lectura etiqueta

function leerEtiqueta(Titulo) {
    if (!data[Titulo]) {
        return-1;
    } else {
        return 0;
    }
}

//Borrado etiqueta

function borrarEtiqueta(idAutor, Titulo) {
    if (!data[Titulo]) {
        return -1;
    } else if (data[Titulo].autor !== idAutor) {
        return -2;
    } else {
        return 0;
    }
}

//Editar etiqueta

function editarEtiqueta(idAutor, Titulo, Texto) {
    if (!data[Titulo]) {
        return -2;
    } else if (data[Titulo].autor !== idAutor) {
        return -1;
    } else {
        return 0;
    }
}

//Copiar etiqueta

function copiarEtiqueta(idAutor, Titulo1, Titulo2) {
    if (data[Titulo2]) {
        return -3;
    } else if (!data[Titulo1]) {
        return -2;
    } else if (data[Titulo1].autor !== idAutor) {
        return -1;
    } else {
        return 0;
    }
}

//Linea  para inicio del bot

bot.on('ready', () => {

    console.log(`Logged in as ${bot.user.tag}!`);

});

//Token de funcionamiento

bot.login(process.env.BOT_TOKEN);
