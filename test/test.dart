import 'dart:convert';

import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

class SocketService {
  IO.Socket get socket => _socket;
  late final IO.Socket _socket;

  Future<void> connect(String host, int port, String token) async {
    _socket = IO
        .io('http://localhost:3000',
        OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .setQuery({
              'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI2MjkyMTYwOTEsInVzZXJfaWQiOiI1OTEyYTQwYS02MzJhLTQ2ZWYtOTA1Ni0xZGIyODQyNzI5ZDgiLCJjbGllbnRfaWQiOiI4NDYzNzMyNy00MjZiLTRlMzItOGY0YS1jMzg2YWE3MmE4YmMiLCJpYXQiOjE2MjkyMTYwOTJ9.wnQPDbv7_cE7xjDwF0SEJFy_77UM90vsEcfJKgr2Afw',
            })
            .build());

    _socket.on('msgsOnServer', (msgIds) {
      msgIds = msgIds.map<String>((msgId) => msgId as String).toList();
      socket.emit('emitMsgsOnServerWithData', jsonEncode(msgIds));
    });

    _socket.on('msgsOnServerWithData', (msgs) {
      msgs = msgs.map<Map<String, dynamic>>((msg) => msg as Map<String, dynamic>).toList();
      final ids = msgs.map<String>((msg) => msg['id'] as String).toList();
      socket.emit('msgsSendOnClient', jsonEncode(ids));
    });

    _socket.on('msgsReceive', (msgs) {
      msgs = msgs.map<Map<String, dynamic>>((msg) => msg as Map<String, dynamic>).toList();
      final ids = msgs.map<String>((msg) => msg['id'] as String).toList();
      print('Received: $msgs');
      socket.emit('msgsReceived', jsonEncode(ids));
    });

    socket.onConnect((_) {
      print('connect');
    });
    
    socket.emit('sendMsg', {'receiver_id': '5912a40a-632a-46ef-9056-1db2842729d8', 'data': '123'});
    
    socket.onDisconnect((_) {
      print('disconnect');
    });
  }
}
