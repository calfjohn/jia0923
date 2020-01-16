/**
 * Created by calf on 16/10/26.
 */

'use strict';

require('letsencrypt-express').create({

    server: 'https://acme-v01.api.letsencrypt.org/directory',
    email: 'develop@aliensidea.com',
    agreeTos: true,
    approveDomains: [ 'qa.btpassportserver.318wg.com.cn', 'qa.httpgameserver.318wg.com.cn' ],
    app: require('express')().use('/', function (req, res) {
        res.end('Hello, World!');
    })

}).listen(80, 443);