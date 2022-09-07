export function isTrueSet(myValue) {
    return (myValue === 'true');
} 

export const sleep = ms => new Promise(r => setTimeout(r, ms));
