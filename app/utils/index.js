export const pickRandom = (arr) => {
    if (!arr || arr.length === 0) return null; //Protegemos la función de un array vacío
    return arr[Math.floor(Math.random() * arr.length)];
};
