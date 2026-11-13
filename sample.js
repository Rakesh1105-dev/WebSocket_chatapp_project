import { WebSocketServer } from "ws";
import{randomUUID} from 'node:crypto';

const wss=new WebSocketServer({port:3000});
//ab mujhe ek mapping table create karna padega
const rooms=new Map();

wss.on('connection',(ws)=>{
    console.log("client is connected",wss.clients.size);
    //frontend se jo bhi request ayega:-
    ws.on('message',(data)=>{
        //create room karna hai
        const message=JSON.parse(data.toString()); //kyuki raw bite me data ko string me convert karna padehta hai
       if(message.type=='create_room'){
        //room id generate karna padega
        const room_Id=randomUUID();
        //ab user ki info room_id ke sath map me dalne padega.
        //key- room id and value-client
        rooms.set(room_Id,new Set([ws]));
        ws.room_Id=room_Id;
        ws.userName=message.userName;
        ws.send(JSON.stringify({
            type:"room_created",
            room_Id
        }));
       }
    //join  room
    else if(message.type=="join_room"){
      const roomId=message.room_Id;
      const clients=rooms.get(roomId);
      if(!clients){
        ws.send(JSON.stringify({
            type:"error",
            text:"check the room-id you have entered is wrong!!"
        }))
        return;
      }
      //agar roo id valid huye toh add karo
      clients.add(ws);
      ws.room_Id=roomId;
     ws.userName=message.userName;
      ws.send(JSON.stringify({
        type:"room_joined",
       
      })) 
    }
    //chat
    if(message.type=="chat"){
        const room_Id=message.room_Id;
        const clients=rooms.get(room_Id);
        if(!clients){
             ws.send(JSON.stringify({
            type:"error",
            text:"check the room-id you have entered is wrong!!"
        }))
        return;
        }
        for(const client of clients){
            client.send(JSON.stringify({
                type:"messages",
                text:message.text,
                userName:message.userName
            }));
        }
    }
    //connection close
    })
   
ws.on('close',()=>{
    //map se sara details remove karna padega.
    const room_Id=ws.room_Id;
    const clients=rooms.get(room_Id);
    if(!clients)
        return;
    clients.delete(ws);
    if(clients.size ==0){
        rooms.delete(room_Id);
    }
})
})
console.log("websocket connection listening to the port:3000");