import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, getDocs, query, updateDoc, orderBy  } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};
console.log(import.meta.env.VITE_AUTH_DOMAIN, import.meta.env.VITE_PRUEBA)
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

export const useApi = () => {
  const getMaterialList = async () => {
    let items = [];
    const data = await getDocs(query(collection(db, "materiales"),orderBy("id", "asc")));
    data.forEach((item) => {
      items.push({id: item.id, ...item.data()});
    });
    return items;
  };

  const addMaterial = async (data) => {
    try { 
        await setDoc(doc(db, "materiales", data.id.toString()), data);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  }

  const updateMaterial = async (id, data) => {
    try {
        await updateDoc(doc(db, "materiales", id.toString()), data);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
  };

  return {
    getMaterialList,
    addMaterial,
    updateMaterial,
  };
};
