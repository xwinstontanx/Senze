import firestore from '@react-native-firebase/firestore';

let dbRef;

export default function getRoleId(userCredentials) {
  return new Promise((resolve, reject) => {
    try {
      firestore()
        .collection('Users')
        .doc(userCredentials.uid)
        .get()
        .then(data => {
          if (data.exists) {
            resolve(data.data());
          } else {
            reject('User not found');
          }
        })
        .catch(e => {
          console.log(e);
          reject(e);
        });
    } catch (e) {
      reject({message: 'User not found'});
    }
  });
}
