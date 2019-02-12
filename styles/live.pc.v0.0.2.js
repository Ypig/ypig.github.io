/**
 * PC端直播页面直播SDK破解版.js
 *
 * Created by Ypig.
 */
!(function ($, window, document) {

    var allowFullscreen = 'true';

    var isLockScreen = false;

    var isLoadingCompleted = false;

    var nv = '0.8.0';

    try {
        function isNeedUpdate(newV, currentV) {
            var segmentsA = newV.replace(/(\.0+)+$/, '').split('.');
            var segmentsB = currentV.replace(/(\.0+)+$/, '').split('.');

            var l = Math.min(segmentsA.length, segmentsB.length);

            for (var i = 0; i < l; i++) {
                var diff = parseInt(segmentsA[i], 10) - parseInt(segmentsB[i], 10);
                if (diff !== 0) {
                    return diff > 0;
                }
            }

            return (segmentsA.length - segmentsB.length) > 0;
        }

        window.on_cc_cclivevc = function (cv) {
            if (isNeedUpdate(nv, cv)) {
                updateCCLivevc();
            }
        };
    } catch (e) {
    }

    try {
        window.on_cc_swf_loading_completed_cclivevc = function (id) {
            isLoadingCompleted = true;
        };

        if (require && require('electron')) {
            allowFullscreen = 'false';

            var ipcRenderer = require('electron').ipcRenderer;

            var CHANNEL_SIGNAL_CORPS = 'signal_corps';
            var SIGNAL_CORPS_ACTION = {
                LOCK_SCREEN: 'lock_screen',
                UNLOCK_SCREEN: 'unlock_screen',
                UPDATE_CCLIVEVC: 'update_cclivevc',
                OPEN_DEV_TOOLS: 'open_dev_tools'
            };

            $('#logout').remove();

            function lockScreen() {
                if (!isLoadingCompleted) {
                    return setTimeout(function () {
                        lockScreen();
                    }, 1000);
                }

                if (isLockScreen) {
                    return;
                }

                isLockScreen = true;
                ipcRenderer.sendToHost(CHANNEL_SIGNAL_CORPS, SIGNAL_CORPS_ACTION.LOCK_SCREEN);
            }

            function unLockScreen() {
                if (!isLoadingCompleted) {
                    return setTimeout(function () {
                        unLockScreen();
                    }, 1000);
                }

                if (!isLockScreen) {
                    return;
                }

                isLockScreen = false;
                ipcRenderer.sendToHost(CHANNEL_SIGNAL_CORPS, SIGNAL_CORPS_ACTION.UNLOCK_SCREEN);
            }

            function updateCCLivevc() {
                ipcRenderer.sendToHost(CHANNEL_SIGNAL_CORPS, SIGNAL_CORPS_ACTION.UPDATE_CCLIVEVC, 'http://dl.csslcloud.net/live/clientvc/windows/CCLivevc' + nv + '.exe');
            }
        }
    } catch (e) {

    }

    var ifropts = {
        logoutJumpURL: '',
        kickOutJumpURL: ''
    };

    if (window.addEventListener) {
        window.addEventListener('message', function (event) {
            ifropts = toJson(event.data);
        });
    } else {
        window.attachEvent('onmessage', function (event) {
            ifropts = toJson(event.data);
        });
    }

    // 直播播放器信息
    var LivePlayer = function (opts) {
        this.isReady = false;
        this.isPublishing = 0;
        this.id = opts.livePlayer.id;
        this.isBan = false;
        this.banReason = '';

        var swfUrl = '//zeus.csslcloud.net/flash/Player.swf';

        var flashvars = {
            'language': $.cookie('lang'),
            'userid': opts.userId,
            'roomid': opts.roomId,
            'foreignPublish': opts.foreignPublish,
            'warmvideoid': opts.warmVideoId,
            'viewerid': opts.viewerId,
            'openhostmode': opts.roomSetting.openHostMode, // 多主讲
            'dvr': opts.roomSetting.dvr,
            'countDownTime': opts.roomSetting.countdown,
            'barrage': encodeURIComponent(opts.roomSetting.barrage || ''),
            'backgroundImageUri': encodeURIComponent(opts.livePlayer.backgroundImageUri || ''),
            'backgroundHint': encodeURIComponent(opts.livePlayer.backgroundHint || ''),
            'type': 'liveplayer',
            'upid': opts.upId,
            'openMultiQuality': opts.roomSetting.openMultiQuality,
            'ua': '0'
        };

        var buffer = opts.livePlayer.buffer;
        if (buffer > 0) {
            flashvars.buffer = buffer;
        }

        var params = {
            allowFullscreen: allowFullscreen,
            allowScriptAccess: 'always',
            wmode: 'transparent'
        };

        this.init = function (obliged) {
            if (obliged || !this.getFlash()) {
                swfobject.embedSWF(swfUrl, opts.livePlayer.id, opts.livePlayer.width, opts.livePlayer.height,
                    '10.0.0', '/flash/expressInstall.swf', flashvars, params);

                window.UNKNOWSTATUSASKLX = false;
                if (this.isBan) {
                    if (typeof window.on_cc_live_room_ban === 'function') {
                        window.on_cc_live_room_ban(this.banReason);
                    }
                }

            }
        };

        this.getFlash = function () {
            return swfobject.getObjectById(this.id);
        };

        // 获取当前播放时间
        this.getPlayerTime = function () {
            if (!this.getFlash()) {
                return;
            }

            var t = parseInt(this.getFlash()._time());
            if (isNaN(t) || t < 0) {
                return 0;
            }
            return t;
        };

        // 获取Flash延迟时间
        this.getDeltaTime = function () {
            if (!this.getFlash()) {
                return 0;
            }

            var t = parseInt(this.getFlash()._GetDeltaTime());
            if (isNaN(t) || t < 0) {
                return 0;
            }
            return t;
        };

        // 开始推流
        this.start = function () {
            if (!this.getFlash()) {
                return;
            }

            if (this.isBan) {
                return;
            }

            this.isPublishing = 1;
            this.getFlash()._streamStart();
        };

        // 结束推流
        this.end = function () {
            if (!this.getFlash()) {
                return;
            }

            if (this.isBan) {
                return;
            }

            this.isPublishing = 0;
            this.getFlash()._streamEnd();
        };

        // 获取线路信息
        this.getPlayLine = function () {
            if (!this.getFlash()) {
                return;
            }

            var lines = this.getFlash().getLine();
            if (lines) {
                lines = JSON.parse(lines);
            }
            return lines;
        };

        // 切换线路
        this.changeLine = function (line, callback) {
            if (!this.getFlash()) {
                return;
            }

            var err = undefined;
            try {
                this.getFlash().changeLine(line);
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 弹幕
        this.barrage = function (m) {
            if (!m) {
                return;
            }

            if (!this.getFlash()) {
                return;
            }

            var newm = $.trim(m);
            if (!newm) {
                return;
            }
            newm = m.replace(/\[em2?_([0-9]*)\]/g, '');

            if (this.getFlash()._jsTOASbarrage) {
                this.getFlash()._jsTOASbarrage({
                    'txt': newm
                });
            }
        };
        //批量添加弹幕功能,现在直播页面默认走这个方法;(对于表情字符串处理，flash内部进行了处理);
        this.barrageList = function (m) {
            if (!m) {
                return;
            }
            if (!this.getFlash()) {
                return;
            }
            if (this.getFlash()._jsToAsBarrageList) {
                this.getFlash()._jsToAsBarrageList(m);
            }

        };

        // 关闭弹幕按钮
        this.closeBarrage = function () {
            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._barrage(false);
        };

        // 开启弹幕按钮
        this.openBarrage = function () {
            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._barrage(true);
        };

        // 打开声音
        this.openSound = function () {
            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._onSound();
        };

        // 关闭声音
        this.closeSound = function () {
            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._unSound();
        };

        // 封禁直播间
        this.ban = function (reason) {
            this.isBan = true;
            this.banReason = reason;

            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._banLive(reason);
        };

        // 解封直播间
        this.unban = function () {
            this.isBan = false;
            this.banReason = '';

            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._unbanLive();
        };

        // 显示跑马灯功能
        this.showMarquee = function (marquee) {
            if (!marquee) {
                return;
            }

            if (!this.getFlash()) {
                return;
            }

            this.getFlash()._showMarqueePlugin(marquee);
        };
        this.closeMarquee = function () {
            if (!this.getFlash()) {
                return;
            }
            if (this.getFlash()._closeMarqueePlugin) {
                this.getFlash()._closeMarqueePlugin({name: 'PluginForMarquee'});
            }
        };

        this.init(true);
    };

    // 创建socket对象，负责进行socket通信，以及监听socket事件
    var Socket = function (opts, player, live) {
        var params = {
            sessionid: opts.viewer.sessionId,
            platform: 1,
            terminal: 0
        };

        if (window.location.protocol === 'https:') {
            params.secure = true;
        }

        var host = opts.chat.host;
        var spareHost = opts.chat.spareHost;
        var socket = io.connect(SocketUtils.getConnectURI(host, opts.roomId), {
            query: params
        });

        // 重连失败，更换为备用线路
        new SocketSentinel(socket, SocketUtils.getConnectURI(spareHost, opts.roomId));

        socket.on('reconnect', function (d) {
            debug('reconnect', 'socket reconnect ' + d);

            if (typeof window.on_cc_live_socket_reconnect === 'function') {
                window.on_cc_live_socket_reconnect();
            }
        });
        socket.on('disconnect', function (d) {
            debug('disconnect', 'socket disconnect ' + d);

            if (typeof window.on_cc_live_socket_disconnect === 'function') {
                window.on_cc_live_socket_disconnect();
            }
        });

        // 验证成功
        socket.on('connect', function () {
            try {
                if (typeof window.on_cc_live_handshake_success === 'function') {
                    window.on_cc_live_handshake_success();
                }
            } catch (e) {
                if (typeof window.on_cc_live_handshake_fail === 'function') {
                    window.on_cc_live_handshake_fail();
                }
            }
        });

        // 获取聊天信息
        socket.on('chat_message', function (data) {
            live.chatMessageCache.push(data);

            // if (typeof window.on_cc_live_chat_msg === 'function') {
            //     window.on_cc_live_chat_msg(toJson(data));
            // }
        });
        socket.on('chat_log_manage' , function (data) {
            if(typeof window.on_cc_live_chat_manage ==='function'){
                window.on_cc_live_chat_manage(toJson(data));
            }
        });

        // 广播信息
        socket.on('broadcast_msg', function (data) {
            if (typeof window.on_cc_live_broadcast_msg === 'function') {
                window.on_cc_live_broadcast_msg(toJson(data).value);
            }
        });

        // 单个用户禁言，发送聊天返回事件
        socket.on('silence_user_chat_message', function (data) {
            if (typeof window.on_cc_live_chat_msg === 'function') {
                window.on_cc_live_chat_msg(toJson(data));
            }
        });

        // 消息提醒
        socket.on('notification', function (data) {
            if (typeof window.on_cc_live_notification === 'function') {
                window.on_cc_live_notification(data);
            }
        });

        // 接收发送私聊函数
        socket.on('private_chat_self', function (data) {
            // 接受返回私聊数据
            if (typeof window.on_cc_live_chat_private_question === 'function') {
                window.on_cc_live_chat_private_question(toJson(data));
            }
        });

        // 接收回答私聊函数
        socket.on('private_chat', function (data) {
            if (typeof window.on_cc_live_chat_private_answer === 'function') {
                window.on_cc_live_chat_private_answer(toJson(data));
            }
        });

        // 在[chat_message，private_question，question]事件中，如果用户没有权限，则回调该函数显示提示信息
        socket.on('information', function (data) {
            // data(string) 提示信息
            if (typeof window.on_cc_live_information === 'function') {
                window.on_cc_live_information(data);
            }
        });

        // 直播开始推流
        socket.on('publish_stream', function (data) {
            setTimeout(function () {
                live.livePlayer.start();

                if (typeof window.on_cc_live_start === 'function' && player.isReady) {
                    window.on_cc_live_start(data);
                }
            }, Math.ceil(Math.random() * 1500));
        });

        // 直播结束推流
        socket.on('end_stream', function (data) {
            var delay = getDelayTime();
            setTimeout(function () {
                debug('play', '结束推流');

                if (typeof unLockScreen === 'function') {
                    unLockScreen();
                }

                live.livePlayer.end();
                live.drawPanel.clear();

                if (typeof window.on_cc_live_end === 'function') {
                    window.on_cc_live_end(data);
                }
            }, delay);
        });

        // 显示画板信息
        socket.on('draw', function (data) {
            if (typeof window.on_cc_live_dw_draw === 'function') {
                window.on_cc_live_dw_draw(data);
            }
        });

        // 画板文档翻页
        socket.on('page_change', function (data) {
            if (typeof window.on_cc_live_dw_page_change === 'function') {
                window.on_cc_live_dw_page_change(data);
            }
        });

        // 动画翻页
        socket.on('animation_change', function (data) {
            if (typeof window.on_cc_live_dw_animation_change === 'function') {
                window.on_cc_live_dw_animation_change(data);
            }
        });

        // 发布提问
        socket.on('publish_question', function (data) {
            if (typeof window.on_cc_live_qa_publish === 'function') {
                window.on_cc_live_qa_publish(toJson(data));
            }
        });

        // 提问
        socket.on('question', function (data) {
            if (typeof window.on_cc_live_qa_question === 'function') {
                window.on_cc_live_qa_question(toJson(data));
            }
        });

        // 回答
        socket.on('answer', function (data) {
            if (typeof window.on_cc_live_qa_answer === 'function') {
                window.on_cc_live_qa_answer(toJson(data));
            }
        });

        // 直播间信息
        socket.on('room_setting', function (data) {
            data = toJson(data);

            if (data.is_ban === 'true') {
                if (typeof window.on_cc_live_room_ban === 'function') {
                    window.on_cc_live_room_ban(data.ban_reason);
                }
            }

            if (data.lock_screen === 'true' && typeof lockScreen === 'function') {
                setTimeout(function () {
                    lockScreen();
                }, 1500);


            } else if (typeof unLockScreen === 'function') {
                setTimeout(function () {
                    unLockScreen();
                }, 1500);
            }

            // {"allow_chat": "true", "allow_question": "true", "allow_speak_interaction": "true"}
            if (typeof window.on_cc_live_setting === 'function') {
                window.on_cc_live_setting(data);
            }
        });

        // 在线人数
        socket.on('room_teachers', function (data) {
            if (typeof window.on_cc_online_teachers === 'function') {
                window.on_cc_online_teachers(toJson(data));
            }
        });

        // 在线人数
        socket.on('room_user_count', function (data) {
            if (typeof window.on_cc_online_count === 'function') {
                window.on_cc_online_count(data);
            }
        });

        // 被踢出
        socket.on('kick_out', function (data) {
            if (typeof window.on_cc_live_logout === 'function') {
                window.on_cc_live_logout(data);
            }

            live.livePlayer.isPublishing = 0;

            if (typeof unLockScreen === 'function') {
                unLockScreen();
            }

            setTimeout(function () {
                live.logout(true);
            }, 2000);
        });

        // 签到功能
        socket.on('start_rollcall', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_start_rollcall === 'function') {
                window.on_cc_live_start_rollcall(data);
            }
        });

        // 开始抽奖
        socket.on('start_lottery', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_start_lottery === 'function') {
                window.on_cc_live_start_lottery(data);
            }
        });

        // 中奖
        socket.on('win_lottery', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_win_lottery === 'function') {
                window.on_cc_live_win_lottery(data);
            }
        });

        // 结束抽奖
        socket.on('stop_lottery', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_stop_lottery === 'function') {
                window.on_cc_live_stop_lottery(data);
            }
        });

        // 开始答题
        socket.on('start_vote', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_start_vote === 'function') {
                window.on_cc_live_start_vote(data);
            }
        });

        // 结束答题
        socket.on('stop_vote', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_stop_vote === 'function') {
                window.on_cc_live_stop_vote(data);
            }
        });

        // 答题结果
        socket.on('vote_result', function (data) {
            data = toJson(data);
            if (typeof window.on_cc_live_vote_result === 'function') {
                window.on_cc_live_vote_result(data);
            }
        });

        // 第三方问卷
        socket.on('external_questionnaire_publish', function (data) {
            data = toJson(data);
            if (typeof window.on_external_questionnaire_publish === 'function') {
                window.on_external_questionnaire_publish(data);
            }
        });

        // 讲师接受互动信息
        socket.on('accept_speak', function (data) {
            // {viewerId:'asfasga',viewerName:'请求者', type'video/audio'}
            if (typeof window.on_cc_live_accept_interaction === 'function') {
                window.on_cc_live_accept_interaction(toJson(data));
            }
        });

        // 互动信息
        socket.on('speak_message', function (data) {
            if (typeof window.on_cc_live_interaction_message === 'function') {
                window.on_cc_live_interaction_message(toJson(data));
            }
        });

        // 已经在聊天的列表信息
        socket.on('speak_peer_list', function (data) {
            if (typeof window.on_cc_live_interaction_chatusers === 'function') {
                window.on_cc_live_interaction_chatusers(toJson(data));
            }
        });

        // 挂断互动信息
        socket.on('speak_disconnect', function (data) {
            if (typeof window.on_cc_live_interaction_disconnect === 'function') {
                window.on_cc_live_interaction_disconnect(toJson(data));
            }
        });

        socket.on('error_information', function (data) {
            if (typeof window.on_cc_live_error === 'function') {
                window.on_cc_live_error(toJson(data));
            }
        });

        /**
         * 公告（发布，删除）
         *  data = {
         *     action: 'release|remove',
         *     announcement: '公告内容'
         *  }
         * */
        socket.on('announcement', function (data) {
            data = toJson(data);

            if (data.action == 'release') {
                if (typeof window.on_cc_live_announcement_release === 'function') {
                    window.on_cc_live_announcement_release(data);
                }
            } else if (data.action == 'remove') {
                if (typeof window.on_cc_live_announcement_remove === 'function') {
                    window.on_cc_live_announcement_remove(data);
                }
            }
        });

        /**
         * 直播间封禁回调
         * */
        socket.on('ban_stream', function (data) {
            data = toJson(data);

            if (typeof window.on_cc_live_room_ban === 'function') {
                window.on_cc_live_room_ban(data.reason);
            }
        });

        /**
         * 直播间解封回调
         * */
        socket.on('unban_stream', function () {
            if (typeof window.on_cc_live_room_unban === 'function') {
                window.on_cc_live_room_unban();
            }
        });

        /**
         * 发布问卷
         * */
        socket.on('questionnaire_publish', function (data) {
            data = toJson(data);

            if (typeof window.on_cc_live_questionnaire_publish === 'function') {
                window.on_cc_live_questionnaire_publish(data);
            }
        });

        /**
         * 结束发布问卷
         * */
        socket.on('questionnaire_publish_stop', function (data) {
            data = toJson(data);

            if (typeof window.on_cc_live_questionnaire_publish_stop === 'function') {
                window.on_cc_live_questionnaire_publish_stop(data);
            }
        });

        /**
         * 发布问卷统计
         * */
        socket.on('questionnaire_publish_statis', function (data) {
            data = toJson(data);

            if (typeof window.on_cc_live_questionnaire_publish_statis === 'function') {
                window.on_cc_live_questionnaire_publish_statis(data);
            }
        });

        socket.on('reward', function (data) {
            data = toJson(data);

            if (typeof window.on_cc_live_reward === 'function') {
                window.on_cc_live_reward(data);
            }
        });

        // 发送聊天信息
        live.chatFrequency = true;
        live.chatFrequencyTime = 1;
        this.sendChat = function (msg, isPrivateChat, callback, touserid, tousername) {
            debug('发送isPrivateChat=' + isPrivateChat + '聊天：', msg);
            var err = undefined;
            try {
                if (!live.chatFrequency) {
                    throw Lr.chatErrorTooOften;
                }

                msg = $.trim(msg);
                if (!msg) {
                    throw Lr.chatErrorMsgBlank;
                }
                if (msg.length > 300) {
                    throw Lr.chatErrorMsgTooLong;
                }

                var nmsg = '';
                $.each(msg.split(' '), function (i, n) {
                    var ur = /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
                    if (ur.test(n)) {
                        nmsg += '[uri_' + n + '] ';
                    } else {
                        nmsg += n + ' ';
                    }
                });

                if (isPrivateChat) {
                    var h = new Date().getHours(),
                        m = new Date().getMinutes(),
                        s = new Date().getSeconds();
                    m = m > 9 ? m : '0' + m;
                    s = s > 9 ? s : '0' + s;
                    var j = {
                        'fromuserid': opts.viewer.id,
                        'fromusername': opts.viewer.name,
                        'fromuserrole': opts.viewer.role,
                        'touserid': touserid,
                        'tousername': tousername,
                        'msg': $.trim(msg),
                        'time': h + ':' + m + ':' + s
                    };
                    socket.emit('private_chat', JSON.stringify(j));
                } else {
                    socket.emit('chat_message', $.trim(nmsg));
                }

                setTimeout(function () {
                    live.chatFrequency = true;
                }, live.chatFrequencyTime);
                live.chatFrequency = true;
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 客户发出提问信息
        live.qaFrequency = true;
        live.qaFrequencyTime = 5 * 1000;
        this.question = function (content, callback) {
            var j = {
                'action': 'question',
                'value': {
                    'userId': opts.viewer.id,
                    'userName': opts.viewer.name,
                    'content': $.trim(content)
                }
            };

            debug('提问：', j);

            var err = undefined;
            try {
                if (player.isPublishing == 0) {
                    throw Lr.qaErrorNoLive;
                }

                if (!live.qaFrequency) {
                    throw Lr.qaErrorTooOften;
                }

                var q = j.value.content;
                if (!q) {
                    throw Lr.qaErrorQuestionBlank;
                }
                if (q.length > 300) {
                    throw Lr.qaErrorQuestionTooLong;
                }

                socket.emit('question', JSON.stringify(j));
                setTimeout(function () {
                    live.qaFrequency = true;
                }, live.qaFrequencyTime);
                live.qaFrequency = false;
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 请求频率
        live.interactionFrequency = true;
        live.interactionFrequencyTime = 5 * 1000;
        // 请求互动
        this.requestInteraction = function (p, callback) {

            var t = 'audio';

            if (p.video) {
                t += 'video';
            }

            var j = {
                'viewerId': opts.viewer.id,
                'viewerName': opts.viewer.name,
                'type': t
            };

            var err = undefined;
            try {
                //request_speak{viewerId:'asfasga',viewerName:'请求者', type'video/audio'}
                socket.emit('request_speak', JSON.stringify(j));
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 进入互动房间
        this.enterInteractionRoom = function (callback) {
            var err = undefined;
            try {
                socket.emit('speak_enter');
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 发送互动信息
        this.sendInteractionMessage = function (p, toId, event, data, callback) {
            var type = 'audio';
            if (p.video) {
                type = 'audiovideo';
            }

            var j = {
                type: type,
                fromname: opts.viewer.name,
                fromid: opts.viewer.id,
                fromrole: 'student',
                toid: toId,
                event: event,
                data: JSON.stringify(data)
            };

            var err = undefined;
            try {
                socket.emit('speak_message', JSON.stringify(j));
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        //挂断互动
        this.hangupInteraction = function (type, callback) {
            var j = {
                'viewerId': opts.viewer.id,
                'viewerName': opts.viewer.name,
                'type': type
            };

            debug('interaction', '挂断事件：' + JSON.stringify(j));

            var err = undefined;
            try {
                socket.emit('hangup_interaction', JSON.stringify(j));
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        // 取消申请
        this.cancelRequestInteraction = function (type, callback) {
            var j = {
                'viewerId': opts.viewer.id,
                'viewerName': opts.viewer.name,
                'type': type
            };

            debug('interaction', '取消申请：' + JSON.stringify(j));

            var err = undefined;
            try {
                socket.emit('cancel_request_speak', JSON.stringify(j));
            } catch (e) {
                err = e;
            } finally {
                if (typeof callback === 'function') callback(err);
            }
        };

        this.answerRollcall = function (rid, pid) {
            var j = {
                'rollcallId': rid,
                'userId': opts.viewer.id,
                'userName': opts.viewer.name,
                'publisherId': pid
            };
            socket.emit('answer_rollcall', JSON.stringify(j));
        };

        this.replyVote = function (voteid, option, pid) {
            var j = {
                'voteId': voteid,
                'voteOption': option,
                'publisherId': pid
            };
            socket.emit('reply_vote', JSON.stringify(j));
        };

        setTimeout(function () {
            try {
                socket.emit('room_user_count');
            } catch (e) {
            }
            try {
                socket.emit('room_teachers');
            } catch (e) {
            }
        }, 1500);
        setInterval(function () {
            try {
                socket.emit('room_user_count');
            } catch (e) {
            }
            try {
                socket.emit('room_teachers');
            } catch (e) {
            }
        }, 15000);
    };

    // 打印debug信息
    var debug = function (t, d) {
        var isDegbug = false;
        if (!isDegbug) {
            return;
        }

        if (console && typeof console.log === 'function') {
            console.log(t, d);
        }
    };

    function toJson(data) {
        if (typeof data === 'string') {
            try {
                return JSON.parse(data);
            } catch (e) {
                return {};
            }
        }

        return data;
    }

    function initDrawPanelInfo() {
        live.drawPanel.history(historyMeta);
    }

    var DrawPanel = function (opts) {
        this.isReady = true;

        if (Dpc) {
            window.dpc = new Dpc();
        }
        this.dpc = window.dpc;

        this.clear = function () {
            this.dpc.clear();
        };

        // 画图
        this.draw = function (j) {
            this.dpc.draw(j);
        };

        this.history = function (meta) {
            this.dpc.history(meta);
        };

        // 翻页
        this.filp = function (j) {
            this.dpc.pageChange(j);
        };

        // 动画
        this.animation = function (j) {
            this.dpc.animationChange(j);
        };
        this.showMarquee = function (value) {
            this.dpc.openMarquee(value);
        };
        this.closeMarquee = function () {
            this.dpc.closeMarquee();
        };
    };

    var isPlayerBarrageReady = false;
    var historyMeta = {};

    // 历史数据
    var History = function (opts) {
        $.getJSON('/api/view/info?userid=' + opts.userId + '&roomid=' + opts.roomId + '&t=' + Math.random(), function (data) {
            if (!data.success) {
                return;
            }

            if (!data.datas) {
                return;
            }
            var datas = data.datas;
            var meta = datas.meta;
            if (!meta) {
                return;
            }

            live.livePlayer.isPublishing = meta.isPublishing;

            // 没有推流
            if (meta.isPublishing != 1) {
                return;
            }

            // 如果正在推流，获取问卷信息
            if (typeof window.on_cc_live_questionnaire_publish === 'function') {
                window.on_cc_live_questionnaire_publish(data);
            }

            var answers = meta.answer ? meta.answer : [];
            var questions = meta.question ? meta.question : [];
            for (var i = 0; i < answers.length; i++) {
                var answer = answers[i];
                for (var ii = 0; ii < questions.length; ii++) {
                    var question = questions[ii];
                    if (question.encryptId == answer.encryptId) {
                        answer.questionUserId = question.questionUserId;
                    }
                }
            }

            if (questions && questions.length) {
                for (var i = 0; i < questions.length; i++) {
                    var question = questions[i];
                    if (typeof window.on_cc_live_qa_question === 'function') {
                        window.on_cc_live_qa_question({
                            'action': 'question',
                            'value': {
                                'id': question.encryptId,
                                'content': question.content,
                                'userId': question.questionUserId,
                                'userName': question.questionUserName,
                                'isPublish': question.isPublish,
                                'groupId':question.groupId
                            }
                        });
                    }
                }
            }

            if (answers && answers.length) {
                for (var i = 0; i < answers.length; i++) {
                    var answer = answers[i];
                    if (typeof window.on_cc_live_qa_answer === 'function') {
                        window.on_cc_live_qa_answer({
                            'action': 'answer',
                            'value': {
                                'questionId': answer.encryptId,
                                'isPrivate': answer.isPrivate,
                                'content': answer.content,
                                'userId': answer.answerUserId,
                                'userName': answer.answerUserName,
                                'questionUserId': answer.questionUserId,
                                'groupId':answer.groupId
                            }
                        });
                    }
                }
            }

            var chatLogs = meta.chatLog;
            if (chatLogs && chatLogs.length) {
                var cls = [];
                for (var i = 0; i < chatLogs.length; i++) {
                    var chatLog = chatLogs[i];

                    cls.push({
                        'userid': chatLog.userId,
                        'username': chatLog.userName,
                        'userrole': chatLog.userRole,
                        'useravatar': chatLog.userAvatar,
                        'msg': chatLog.content,
                        'chatId':chatLog.chatId,
                        'status':chatLog.status,
                        'time': '',
                        'groupId':chatLog.groupId
                    });
                }

                if (typeof window.on_cc_live_chat_msgs === 'function') {
                    window.on_cc_live_chat_msgs(cls);
                }
            }

            historyMeta = meta;

            initDrawPanelInfo();
        });
    };

    var Chat = function (socket) {
        this.sendChat = function (msg, callback) {
            var isPrivateChat = false;
            socket.sendChat(msg, isPrivateChat, callback);
        };

        this.sendPrivateChat = function (msg, callback, touserid, tousername) {
            var isPrivateChat = true;
            socket.sendChat(msg, isPrivateChat, callback, touserid, tousername);
        };
    };

    var QA = function (socket) {
        this.question = function (content, callback) {
            socket.question(content, callback);
        };
    };

    /**
     * 语音互动支持
     *
     * */
    var Interaction = function (opts, socket) {
        try {
            window.PeerConnection = (window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection || window.mozRTCPeerConnection);
            window.URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
            window.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
            window.nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate);
            window.nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription);
        } catch (e) {
        }

        this.usersPcs = {
            length: 0
        };

        // 本地流信息
        this.local = {
            type: {
                video: false,
                audio: false
            },
            video: {},
            audio: {}
        };

        this.isRequesting = false;

        /**
         * 请求语音互动
         *
         * t = {
         *  video: true,
         *  audio: true
         * }
         * */
        this.requestInteraction = function (t, callback) {
            debug('Interaction', '请求互动');

            this.local.type = t;

            this.isRequesting = true;

            // 请求互动超时计时器
            this.setRequestTimeoutTimer();

            // 创建音视频信息
            this.createLocalMedia(function (error) {
                if (error) {
                    if (typeof window.on_cc_live_interaction_error === 'function') {
                        window.on_cc_live_interaction_error(live.interaction.local.type, error, Lr.interactionErrorCreate);
                    }
                    return;
                }

                socket.requestInteraction(t, callback);
            });
        };


        // 语音通话计时器
        this.setCallingTimer = function () {
            live.interaction.interactionTime = 0;
            live.interaction.interactionTimeInterval = setInterval(function () {
                ++live.interaction.interactionTime;
                if (typeof window.on_cc_live_interaction_interval === 'function') {
                    var p = live.interaction.local.type;
                    var t = live.interaction.interactionTime;
                    window.on_cc_live_interaction_interval(p, t);
                }
            }, 1000);
        };
        // 清除语音通话计时器
        this.clearCallingTimer = function () {
            live.interaction.interactionTime = 0;
            clearInterval(live.interaction.interactionTimeInterval);
        };

        // 互动请求超时定时器
        this.setRequestTimeoutTimer = function () {
            /**
             * 请求互动，60s内没有接受，则自动断开
             *
             * 通知pusher断开
             * */
            live.interaction.REQUEST_INTERACTION_TIMEOUT = setTimeout(function () {
                live.interaction.REQUEST_INTERACTION_TIMEOUT = -1;

                // 超时挂断语音通话
                live.interaction.hangupInteraction(options.viewer.id);
                live.interaction.stopLocalStream();

                live.interaction.isRequesting = false;

                $('#interactionLocalVideo')[0].src = '';
                $('#videoInteraction').hide();

                if (typeof window.on_cc_live_interaction_request_timeout === 'function') {
                    window.on_cc_live_interaction_request_timeout(live.interaction.local.type);
                }
            }, 60000);
        };
        // 清空互动请求超时定时器
        this.clearRequestTimeoutTimer = function () {
            if (live.interaction.REQUEST_INTERACTION_TIMEOUT > 0) {
                clearTimeout(live.interaction.REQUEST_INTERACTION_TIMEOUT);
                live.interaction.REQUEST_INTERACTION_TIMEOUT = -1;
            }
        };

        // 停止本地流
        this.stopLocalStream = function () {
            if (live.interaction.local.video.stream) {
                try {
                    live.interaction.local.video.stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                } catch (e) {
                }
            }

            if (live.interaction.local.audio.stream) {
                try {
                    live.interaction.local.audio.stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                } catch (e) {
                }
            }
        };

        this.cancelInteraction = function () {
            live.interaction.isRequesting = false;

            if (typeof window.on_cc_live_interaction_cancal === 'function') {
                window.on_cc_live_interaction_cancal(live.interaction.local.type);
            }
        };

        // 断开连接
        this.disconnectInteraction = function (uId) {
            live.livePlayer.openSound();

            this.clearRequestTimeoutTimer();

            // 删除所有
            if (uId == options.viewer.id) {
                $.each(live.interaction.usersPcs, function (userId, up) {
                    var pc = up.pc;
                    if (pc == null) {
                        return true;
                    }

                    pc.close();
                    pc = null;

                    if (live.interaction.usersPcs[userId]) {
                        delete live.interaction.usersPcs[userId];
                        var l = live.interaction.usersPcs.length - 1;
                        live.interaction.usersPcs.length = l < 0 ? 0 : l;
                    }

                });
            } else {
                $.each(live.interaction.usersPcs, function (userId, up) {
                    var pc = up.pc;
                    if (!pc) {
                        return true;
                    }

                    if (userId != uId) {
                        return true;
                    }

                    pc.close();
                    pc = null;

                    if (live.interaction.usersPcs[userId]) {
                        delete live.interaction.usersPcs[userId];
                        var l = live.interaction.usersPcs.length - 1;
                        live.interaction.usersPcs.length = l < 0 ? 0 : l;
                    }
                });
            }

            if (live.interaction.usersPcs.length == 0) {
                this.stopLocalStream();
            }

            live.interaction.isInteractioning = false;
            live.interaction.isRequesting = false;
        };

        // 创建本地音视频流
        this.createLocalAudioAndVideoMedia = function (c) {
            var that = this;
            getUserMedia.call(navigator, {
                video: true,
                audio: true
            }, function (stream) {
                that.local.video.stream = stream;

                if (c && typeof c === 'function') {
                    c(stream);
                }
            }, function (error) {
                debug('Interaction', 'getUserMedia error: ' + error);

                if (c && typeof c === 'function') {
                    c(error);
                }
            });
        };

        // 创建本地音频流
        this.createLocalAudioMedia = function (c) {
            var that = this;
            getUserMedia.call(navigator, {
                video: false,
                audio: true
            }, function (stream) {
                that.local.audio.stream = stream;

                if (c && typeof c === 'function') {
                    c(stream);
                }
            }, function (error) {
                debug('Interaction', 'getUserMedia error: ' + error);

                if (c && typeof c === 'function') {
                    c(error);
                }
            });
        };

        this.createLocalMedia = function (c) {
            var that = this;
            var p = that.local.type;
            getUserMedia.call(navigator, p, function (stream) {
                if (p.video) {
                    that.local.video.stream = stream;
                } else {
                    that.local.audio.stream = stream;
                }

                if (typeof window.on_cc_live_interaction_local_media === 'function') {
                    window.on_cc_live_interaction_local_media(p, stream);
                }

                if (c && typeof c === 'function') {
                    c();
                }
            }, function (error) {
                debug('Interaction', 'getUserMedia error: ' + error);

                if (c && typeof c === 'function') {
                    c(error);
                }
            });
        };

        this.iceServers = {
            'iceServers': [{
                url: 'stun:turn.csslcloud.net:3478?transport=udp',
                credential: 'bokecc',
                username: 'cc'
            }, {
                url: 'turn:turn.csslcloud.net:3478?transport=udp',
                credential: 'bokecc',
                username: 'cc'
            }, {
                url: 'stun:turn.csslcloud.net:3478?transport=tcp',
                credential: 'bokecc',
                username: 'cc'
            }, {
                url: 'turn:turn.csslcloud.net:3478?transport=tcp',
                credential: 'bokecc',
                username: 'cc'
            }]
        };

        // 创建被动创建连接的PC
        this.createAnswerPeerConnection = function (chatuser) {
            var pc = new PeerConnection(this.iceServers);

            if (chatuser.type == 'audio') {
                if (!live.interaction.local.audio.stream) {
                    this.createLocalAudioMedia();
                }
                pc.addStream(live.interaction.local.audio.stream);
            } else {
                if (!live.interaction.local.video.stream) {
                    this.createLocalAudioAndVideoMedia();
                }
                pc.addStream(live.interaction.local.video.stream);
            }

            // 如果检测到媒体流连接到本地，将其绑定到一个audio标签上输出
            pc.onaddstream = function (event) {
                if (typeof window.on_cc_live_interaction_remote_media === 'function') {
                    window.on_cc_live_interaction_remote_media(live.interaction.local.type, chatuser, event.stream);
                }
            };

            pc.createAnswer(function (desc) {
                pc.setLocalDescription(desc);
                socket.sendInteractionMessage(live.interaction.local.type, chatuser.id, 'answer', desc);
            }, function (error) {
                debug('Interaction', 'Failure callback: ' + error);
            });

            pc.onicecandidate = function (event) {
                if (event.candidate !== null) {
                    socket.sendInteractionMessage(live.interaction.local.type, chatuser.id, '', event.candidate);
                }
            };

            live.interaction.usersPcs[chatuser.id] = {
                pc: pc,
                user: chatuser
            };

            live.interaction.usersPcs.length += 1;
        };

        // 创建主动创建连接的PC
        this.createOfferPeerConnection = function (chatuser) {
            var pc = new PeerConnection(this.iceServers);

            var p = live.interaction.local.type;
            if (p.video) {
                pc.addStream(live.interaction.local.video.stream);
            } else {
                pc.addStream(live.interaction.local.audio.stream);
            }

            // 如果检测到媒体流连接到本地，将其绑定到一个audio标签上输出
            pc.onaddstream = function (event) {
                if (typeof window.on_cc_live_interaction_remote_media === 'function') {
                    window.on_cc_live_interaction_remote_media(live.interaction.local.type, chatuser, event.stream);
                }
            };

            pc.oniceconnectionstatechange = function (d) {
                debug('Interaction', 'iceConnectionState ...' + pc.iceConnectionState);

                if (pc.iceConnectionState == 'failed') {
                    debug('Interaction', 'iceConnectionState failed');

                    live.interaction.hangupInteraction();

                    if (typeof window.on_cc_live_interaction_disconnect === 'function') {
                        window.on_cc_live_interaction_disconnect({
                            disconnectid: options.viewer.id
                        });
                    }
                }
            };

            pc.createOffer(function (desc) {
                pc.setLocalDescription(desc);

                socket.sendInteractionMessage(p, chatuser.id, 'offer', desc);
            }, function (error) {
                if (typeof window.on_cc_live_interaction_error === 'function') {
                    window.on_cc_live_interaction_error(live.interaction.local.type, error, 'createOfferPeerConnection');
                }
            });

            pc.onicecandidate = function (event) {
                if (event.candidate !== null) {
                    socket.sendInteractionMessage(p, chatuser.id, '', event.candidate);
                }
            };

            live.interaction.usersPcs[chatuser.id] = {
                pc: pc,
                user: chatuser
            };

            live.interaction.usersPcs.length += 1;
        };

        this.id = opts.interaction.id;

        // 当前浏览器是否支持互动功能
        this.isSupportInteraction = function () {
            return window.location.protocol === 'https:' && !!(PeerConnection && URL && getUserMedia && nativeRTCIceCandidate && nativeRTCSessionDescription);
        };

        // 挂断互动
        this.hangupInteraction = function (callback) {
            if (this.isInteractioning) {
                socket.hangupInteraction(this.type, callback);
            } else if (this.isRequesting) {
                socket.cancelRequestInteraction(this.type, callback);
                this.stopLocalStream();
                this.cancelInteraction();
            } else {
                this.stopLocalStream();
                this.cancelInteraction();
            }
        };
    };

    var ChatMessageCache = function () {
        this.cache = [];
        this.lastTimeRefresh = new Date().getTime();

        this.INTERVAL_TIME = setInterval(function () {
            live.chatMessageCache.refresh();
        }, 80);

        //
        this.push = function (data) {
            // 缓存中超过5000条数据，则丢弃
            if (this.cache.length > 500) {
                return;
            }
            this.cache.push(toJson(data));
        };

        this.ableRefresh = function () {
            var n = new Date().getTime();

            if (this.cache.length == 0) {
                return false;
            }

            if ((n - this.lastTimeRefresh) >= 80) {
                return true;
            }
            return false;
        };

        this.refresh = function () {
            if (!this.ableRefresh()) {
                return;
            }

            clearInterval(this.INTERVAL_TIME);

            var d = [];
            var l = Math.min(this.cache.length, 10);
            for (var i = 0; i < l; i++) {
                d.push(this.cache.shift());
            }

            if (typeof window.on_cc_live_chat_msgs === 'function') {
                window.on_cc_live_chat_msgs(d);
            }

            this.lastTimeRefresh = new Date().getTime();

            this.INTERVAL_TIME = setInterval(function () {
                live.chatMessageCache.refresh();
            }, 80);
        };
    };

    var Live = function (opts) {
        this.logout = function (isKickOut) {
            if (ifropts.kickOutJumpURL || ifropts.logoutJumpURL) {
                $.ajax({
                    url: '/api/live/logout',
                    type: 'GET',
                    dataType: 'json',
                    timeout: 3000,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function () {
                        window.location.href = (isKickOut ? ifropts.kickOutJumpURL : ifropts.logoutJumpURL);
                    },
                    error: function () {
                        window.location.href = (isKickOut ? ifropts.kickOutJumpURL : ifropts.logoutJumpURL);
                    }
                });
            } else {
                window.location.href = '/api/view/logout?userid=' + opts.userId + '&roomid=' + opts.roomId;
            }
        };

        this.livePlayer = new LivePlayer(opts);
        this.chatMessageCache = new ChatMessageCache();
        this.socket = new Socket(opts, this.livePlayer, this);
        this.drawPanel = new DrawPanel(opts, this.livePlayer);
        this.history = new History(opts);
        this.qa = new QA(this.socket);
        this.chat = new Chat(this.socket);
        this.interaction = new Interaction(opts, this.socket);
    };

    var live = {};

    var options = {
        userId: $('#userId').val(),
        roomId: $('#roomId').val(),
        viewerId: $('#viewerId').val(),
        upId: $('#upId').val(),
        // 观看者用户信息
        viewer: {
            id: $('#viewerId').val(),
            name: $('#viewerName').val(),
            role: $('#viewerRole').val(),
            sessionId: $.cookie('sessionid')
        },

        roomSetting: {
            openHostMode: $('#openHostMode').val(),
            dvr: $('#dvr').val(),
            barrage: $('#barrage').val(),
            openMultiQuality: $('#openMultiQuality').val(),
            countdown: $('#liveCountdown').val(),
            documentDisplayMode: $('#documentDisplayMode').val()
        },

        chat: {
            host: $('#chatHost').val(),
            spareHost: $('#backupChatHost').val()
        },

        // 直播播放器信息
        livePlayer: {
            id: 'livePlayer',
            width: '100%',
            height: '100%',
            buffer: $('#delayTime').val(),
            backgroundImageUri: $('#playerBackgroundImageUri').val(),
            backgroundHint: $('#playerBackgroundHint').val()
        },

        // 是否是第三方推流
        foreignPublish: $('#foreignPublish').val(),

        warmVideoId: $('#warmVideoId').val(),

        // 画板信息
        drawPanel: {
            id: 'drawPanel',
            width: '100%',
            height: '100%'
        },

        // 互动信息
        interaction: {
            id: 'interactionPlayer',
            width: '100%',
            height: '100%'
        }
    };

    function init(opts) {
        options = $.extend(options, opts);
        live = new Live(options);
    }

    var DW = {
        // 初始化DW对象
        config: function (opts) {
            init(opts);

            this.setGroupId();
        },

        setGroupId: function () {
            var viewerGroupId = $('#viewerGroupId').val();
            log(viewerGroupId);
            // 数字英语混合
            var rel = /^[0-9a-zA-Z]+$/;
            if (!viewerGroupId || !rel.test(viewerGroupId) || viewerGroupId.length >= 40) {
                log('viewerGroupId不能为空且类型为数字或英文字母，长度小于40');
                viewerGroupId = '';
            }
            //测试，虚拟viewerGroupId
            // viewerGroupId = 1;

            log(viewerGroupId);
            DW.viewerGroupId = viewerGroupId;
        },

        question: function (content, callback) {
            live.qa.question(content, callback);
        },

        sendChat: function (msg, callback) {
            live.chat.sendChat(msg, callback);
        },

        sendPrivateChat: function (msg, callback, touserid, tousername) {
            live.chat.sendPrivateChat(msg, callback, touserid, tousername);
        },

        logout: function (time) {
            if (!time) {
                time = 0;
            }
            setTimeout(function () {
                live.logout();
            }, time);
        },

        changeLine: function (line, callback) {
            live.livePlayer.changeLine(line, callback);
        },

        getPlayLine: function () {
            return live.livePlayer.getPlayLine();
        },

        isPublishing: function () {
            return live.livePlayer.isPublishing == 1;
        },

        // 请求语音互动
        requestInteraction: function (t) {
            live.interaction.requestInteraction(t);
        },

        // 挂断双向视频
        hangupInteraction: function () {
            live.interaction.hangupInteraction();
        },

        // 是否支持rtc互动功能
        isSupportInteraction: function () {
            return live.interaction.isSupportInteraction();
        },

        openSound: function () {
            live.livePlayer.openSound();
        },

        closeSound: function () {
            live.livePlayer.closeSound();
        },

        barrage: function (m) {
            live.livePlayer.barrage(m);
        },
        barrageList: function (v) {
            live.livePlayer.barrageList(v);
        },

        openBarrage: function () {
            live.livePlayer.openBarrage();
        },

        showPlayerMarquee: function (m) {
            live.livePlayer.showMarquee(m);
        },
        initMarqueeInfo: function (data) {
            if (!data) {
                return;
            }
            this.marqueeInfo = data;
            this.switchMainShowMarquee();
        },
        // showDrawPanelMarquee:function (value) {
        //     live.drawPanel.showMarquee(value);
        // },
        // 跑马灯
        switchMainShowMarquee: function () {
            if (!mainViewIsVideo) {
                live.livePlayer.closeMarquee();
                live.drawPanel.showMarquee(this.marqueeInfo);
            } else {
                live.drawPanel.closeMarquee();
                live.livePlayer.showMarquee(this.marqueeInfo);
            }
        },
        // 签到功能
        answerRollcall: function (r, p) {
            live.socket.answerRollcall(r, p);
        },

        // 答题功能
        replyVote: function (v, o, p) {
            live.socket.replyVote(v, o, p);
        }
    };

    window.debug = false;

    if (window.debug) {
        // function log(...info) {
        //     if (window.debug) {
        //         if (console.log) {
        //             console.log('log ', ...info);
        //         }
        //     }
        // }
    } else {
        function log() {

        }
    }

    $.extend({
        DW: DW
    });

    // 画图事件
    window.on_cc_live_dw_draw = function (data) {
        setTimeout(function () {
            // 延迟更新画板数据
            live.drawPanel.draw(data);
        }, getDeltaTime());
    };

    // 翻页事件
    window.on_cc_live_dw_page_change = function (data) {
        setTimeout(function () {
            // 延迟更新画板数据
            live.drawPanel.filp(data);
        }, getDeltaTime());
    };

    // 动画事件
    window.on_cc_live_dw_animation_change = function (data) {
        setTimeout(function () {
            // 延迟更新画板数据
            live.drawPanel.animation(data);
        }, getDeltaTime());
    };

    function getDeltaTime() {
        var b = parseInt($('#delayTime').val(), 10);
        if (isNaN(b) || b < 0) {
            b = 0;
        }
        b = b * 1000;

        //var fdt = live.livePlayer.getDeltaTime();
        // 低延迟
        if (b === 0) {
            return 1300;
        } else {
            return 3000;
        }
    }

    function getDelayTime() {
        var b = parseInt($('#delayTime').val(), 10);
        if (isNaN(b) || b < 0) {
            b = 0;
        }
        if (b) {
            debug('非低延迟模式', b);
        } else {
            debug('低延迟模式', b);
        }
        // b = b * 1000;

        if (b === 0) {
            return 1300;
        } else {
            return 3000;
        }
    }

    // 接受语音互动请求
    window.on_cc_live_accept_interaction = function (data) {
        live.livePlayer.closeSound();

        // 清除请求超时计时器
        live.interaction.clearRequestTimeoutTimer();

        live.socket.enterInteractionRoom();

        live.interaction.isInteractioning = true;

        live.interaction.setCallingTimer();

        if (typeof window.on_cc_live_interaction_accept === 'function') {
            window.on_cc_live_interaction_accept(live.interaction.local.type, toJson(data));
        }
    };

    // 直播播放器准备开始播放
    window._onStart = function () {
        live.livePlayer.isReady = true;

        if (typeof window.on_cc_live_start === 'function' && live.livePlayer.isPublishing) {
            window.on_cc_live_start(live.livePlayer.getPlayLine());
        }
    };

    window.UNKNOWSTATUSASKLX = false;
    // 播放器Flash加载完成，并调用接口信息已获取直播间的信息
    window._swfInit = function () {
        window.UNKNOWSTATUSASKLX = true;
        isPlayerBarrageReady = true;

        if (typeof window.on_cc_live_player_init === 'function') {
            window.on_cc_live_player_init();
        }
    };

    // 主动连接语音聊天信息
    window.on_cc_live_interaction_chatusers = function (data) {
        data = toJson(data);
        $.each(data, function (index, chatuser) {
            if (chatuser.id == options.viewer.id) {
                return true;
            }
            // 客户端只是和主播进行语音互动
            if ((chatuser.role == 'publisher' || chatuser.role == 'host') && !chatuser.isMainSpeaker) {
                return true;
            }
            live.interaction.createOfferPeerConnection(chatuser);
        });

    };

    // 接收互动信息
    window.on_cc_live_interaction_message = function (d) {
        var d = toJson(d);

        debug('Interaction', 'rtc互动信息:' + JSON.stringify(d));

        var toId = d.toid;
        var fromId = d.fromid;
        var fromName = d.fromname;
        var type = d.type;
        var data = d.data;
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        var event = d.event;

        if (event === 'offer') {
            data.type = event;

            live.interaction.createAnswerPeerConnection({
                id: fromId,
                name: fromName,
                type: type
            });

            var pc = live.interaction.usersPcs[fromId].pc;
            if (!pc) {
                return;
            }

            pc.setRemoteDescription(new nativeRTCSessionDescription(data));
            pc.createAnswer(function () {
            }, function (error) {
                debug('Interaction', 'Failure callback: ' + error);
            });
        } else if (event === 'answer') {
            var pc = live.interaction.usersPcs[fromId].pc;
            if (!pc) {
                return;
            }

            data.type = event;

            debug('Interaction', 'answer spark_message信息:' + data);
            pc.setRemoteDescription(new nativeRTCSessionDescription(data));

            pc.receivedAnswer = true;
            if (!pc.hasAddIce && pc.RTCICES) {
                for (var i = 0; i < pc.RTCICES.length; i++) {
                    pc.addIceCandidate(pc.RTCICES[i]);
                }
                pc.RTCICES = [];
            }

        } else {
            var u = live.interaction.usersPcs[fromId];
            if (!u) {
                u = live.interaction.usersPcs[toId];
            }
            var pc = u ? u.pc : null;

            if (!pc) {
                return;
            }

            // 收到answer之后再addIce
            var ice = new RTCIceCandidate(data);
            if (pc.receivedAnswer) {
                pc.hasAddIce = true;
                pc.addIceCandidate(ice);
            } else {
                pc.hasAddIce = false;
                if (!pc.RTCICES) {
                    pc.RTCICES = [];
                }
                pc.RTCICES.push(ice);
            }
        }
    };

    // socket 断开
    window.on_cc_live_socket_disconnect = function (data) {
        //on_cc_live_interaction_disconnect({
        //    disconnectid: options.viewer.id
        //});
    };

    // 断开语音通话
    window.on_cc_live_interaction_disconnect = function (data) {
        var uid = data.disconnectid;
        var isPC = !!live.interaction.usersPcs[uid];

        if (uid != options.viewer.id && !isPC) {
            return;
        }
        if (uid != options.viewer.id && isPC) {
            live.interaction.hangupInteraction();
        }

        // "{"disconnectid":"cecb53305e834214a7a9b38a57d26940"}"
        live.interaction.clearCallingTimer();
        live.interaction.disconnectInteraction(uid);

        // 与所有端断开连接
        if (uid == options.viewer.id || live.interaction.usersPcs.length == 0) {
            live.interaction.stopLocalStream();

            $('li[name="interaction"][t="video"] a').removeClass('audio applying calling').addClass('video');
            $('li[name="interaction"][t="audio"] a').removeClass('audio applying calling').addClass('audio');

            $('li[name="interaction"]').removeClass('disable').show();

            $('#interactionMsg').text('');

            $('#videoInteractions').empty();
            $('#audioInteractions').empty();

            $('#interactionLocalVideo')[0].src = '';

            $('#videoInteraction').hide();

            if (live.interaction.local.type.video) {
                live.livePlayer.init();
                $('#videoInteractions').css('height', '0px');
            }
            $('#btn-network').removeClass('wl-disable');

            if (!window.ALLOW_SPEAK_INTERACTION) {
                $('li[name="interaction"]').hide();
            }
        } else {
            // 断开其他人
        }
    };

    window._apiInit = function () {
        window.UNKNOWSTATUSASKLX = true;
    };

    window.on_cc_live_room_ban = function (reason) {
        if (!UNKNOWSTATUSASKLX) {
            setTimeout(function () {
                window.on_cc_live_room_ban(reason);
            }, 100);
        } else {
            live.livePlayer.ban(reason);
        }
    };

    window.on_cc_live_room_unban = function () {
        if (!UNKNOWSTATUSASKLX) {
            setTimeout(function () {
                window.on_cc_live_room_unban();
            }, 100);
        } else {
            live.livePlayer.unban();
        }
    };

    /**
     * Flash 加载完成
     * */
    window._swfOk = function (id) {
        if (typeof window.on_cc_swf_loading_completed === 'function') {
            window.on_cc_swf_loading_completed(id);
        }
        if (typeof window.on_cc_swf_loading_completed_cclivevc === 'function') {
            window.on_cc_swf_loading_completed_cclivevc(id);
        }
    };


    window.onunload = function (e) {
        if (live && live.interaction) {
            live.interaction.hangupInteraction();
        }
    };
})(jQuery, window, document, undefined);
