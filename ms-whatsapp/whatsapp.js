const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const qrcode = require('qrcode-terminal');
const { Client, Events } = require('whatsapp-web.js');
const { Observable } = require('rxjs');

const SESSIONS_FOLDER = './sessions/'

let qrResult;
let wsClients = [];
let sessionData;

/***********************************************************************************************************
 * Borramos archivo de sesion
 ***********************************************************************************************************/
const deleteSession = (file) => {
    return new Observable(observer => {
        // Borrar archivo JSON
        fs.unlink(file, (err) => {
            if (err) {
                console.error(err)
                observer.next(false);
            } else {
                console.info(chalk.green('Whatsapp: ') + chalk.red('Se ha borrado la sesión.'));
                observer.next(true);
            }
            observer.complete();
        });

    });
}

/***********************************************************************************************************
 * Escuchando mensajes del cliente
 ***********************************************************************************************************/
const listenMessage = (client) => {
    if (client.info) {
        console.info(`${chalk.green('Whatsapp: ')}Escuchando mensajes para  ${client.info.wid.user}`);
        client.on(Events.MESSAGE_RECEIVED, (msg) => {
            const { from, to, body } = msg;
            console.info(`${chalk.yellow('De: ' + from)}`, `${chalk.blue('Para: ' + to)}`, body);

            if (body.toLowerCase() === 'x-hola')
                sendMessage(client, from, 'Como estás?');
            if (body.toLowerCase() === 'x-test')
                sendMessage(client, from, 'Test satisfactorio!');
        });
    } else {
        console.info('listenMessage: ERROR', client.info);
    }
}

/***********************************************************************************************************
 * Enviando mensajes desde el cliente
 ***********************************************************************************************************/
const sendMessage = (client, to, msg) => {
    console.info(`${chalk.blue('De: ' + client.info.wid.user)}`, `${chalk.yellow('Para: ' + to)}`, msg, client.options.session.WABrowserId);
    client.sendMessage(to, msg);
}

/***********************************************************************************************************
 * Eventos asociados al cliente segun estado del mismo
 ***********************************************************************************************************/
const prepareCliente = (client, file) => {

    // Al autenticar usuario (escaneo del QR), se guardar la session en el archivo SESSION_FILE_PATH
    client.on(Events.AUTHENTICATED, (session) => {
        qrResult = undefined;
        // Un letardo para obtener info de la session
        setTimeout(() => {
            session.phonenumber = client.info.wid.user;
            sessionName = 'session_' + session.phonenumber + '.json';
            fs.writeFile(SESSIONS_FOLDER + sessionName, JSON.stringify(session), (callback) => {
                if (callback) {
                    console.error(callback);
                }
            });
        }, 1000);
    });
    
    // Al desconectar
    client.on(Events.DISCONNECTED, (session) => {
        console.info(chalk.red('Se desconectó de Whatsapp...'));
    });

    // Al conectar
    client.on(Events.READY, () => {
        listenMessage(client);
        spinner.stop();
    });

    // Al fallar conexion
    client.on(Events.AUTHENTICATION_FAILURE, () => {
        spinner.stop();
        console.error(chalk.red('Error de autenticacón. Se borrará el archivo ' + file + '!!'));
        // Borramos el archivo
        deleteSession(SESSIONS_FOLDER + file).subscribe();
    });

    // Acumulador de clientes de Whatsapp...
    wsClients.push(client);

    // Iniciamos el cliente de Whatsapp...
    client.initialize();
}

/***********************************************************************************************************
 * Esta funcion genera el QRCODE
 ***********************************************************************************************************/
exports.generateSession = () => {
    return new Observable(observer => {
        if (qrResult) {
            observer.next(qrResult);
            observer.complete();
        } else {
            console.info(chalk.green('Whatsapp: ') + 'Generando sesión...');
            var client = new Client();

            // Generando QRCODE
            client.on(Events.QR_RECEIVED, qr => {
                qrResult = qr;
                console.info(chalk.green('Whatsapp: ') + 'Código QR generado');
                observer.next(qrResult);
                observer.complete();
                // qrcode.generate(qr, { small: true });
            });

            prepareCliente(client);
        }
    });
}

/***********************************************************************************************************
 * Esta funcion recupera las sesiones de los clientes de la carpeta SESSION_FOLDER
 ***********************************************************************************************************/
var spinner = ora(`${chalk.green('Whatsapp: ')} Cargando ${chalk.yellow('Validando sesiones activas en Whatsapp...')}`);
const listenAllSessions = () => {    
    spinner.start();

    fs.readdir(SESSIONS_FOLDER, (err, files) => {
        files.forEach(file => {
            sessionData = require(SESSIONS_FOLDER + file);
            
            var client = new Client({
                session: sessionData,
            });

            prepareCliente(client, file);
        });
    });
}

/***********************************************************************************************************
 * Bloque de funciones accequibles desde la instaciación de esta clase
 ***********************************************************************************************************/
exports.getAllClients = () => {
    return new Observable(observer => {
        const rta = [];
        wsClients.forEach(c => {
            rta.push(c.options);
        });
        observer.next(rta);
        observer.complete();
    });
}

exports.deleteAllSession = () => {
    return new Observable(observer => {
        let sessionsActive = 0;
        fs.readdir(SESSIONS_FOLDER, (err, files) => {
            files.forEach(file => {
                deleteSession(SESSIONS_FOLDER + file).subscribe(r => {
                    sessionsActive++;
                    if (sessionsActive === files.length) {
                        observer.next('Se ha eliminado ' + sessionsActive + ' sesiones');
                        observer.complete();
                    }
                });
            });
        });
    });
}

exports.init = () => {
    fs.readdir(SESSIONS_FOLDER, (err, files) => {
        if (files.length > 0) {
            listenAllSessions();
        }
    });
}