import Actions from '../actions';
import Firebas from 'firebase';

let firebaseRef = null;

let MessagesSource = {
    sendMessage: {
        remote(state){
            return new Promise((resolve, reject)=> {
                if (!firebaseRef) {
                    return resolve();
                }
                firebaseRef.push({
                    "message":state.message,
                    "date":new Date().toUTCString(),
                    "author":state.user.google.displayName,
                    "userId":state.user.uid,
                    "profilePic":state.user.google.profileImageURL
                });
                resolve();
            });
        },
        success: Actions.messagesSendSuccess,
        error: Actions.messagesSendError
    },
    getMessages: {
        remote(state){
            if (firebaseRef) {
                firebaseRef.off();
            }
            firebaseRef =
                new Firebase('https://react-stack-dicarix.firebaseio.com/messages/' +
                    state.selectedChannel.key);
            return new Promise((resolve, reject)=> {
                firebaseRef.once("value", (dataSnapshot)=> {
                    var messages = dataSnapshot.val();
                    resolve(messages);

                    firebaseRef.on("child_added",(msg)=>{
                       let msgVal = msg.val();
                        msgVal.key= msg.key();
                        Actions.messageReceived(msgVal);
                    });
                })
            });
        },
        success: Actions.messagesReceived,
        error: Actions.messageFailed,
        loading: Actions.messagesLoading
    }
}

export default MessagesSource;

