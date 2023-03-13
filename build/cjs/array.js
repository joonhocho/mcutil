"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayMutate = exports.arrayToKeys = exports.arrayIntersection = exports.keysIntersection = exports.arraySubtract = exports.keysSubtract = exports.arrayToMap = exports.keysToMap = exports.moveItem = exports.emptyToNull = exports.findLastIndex = exports.findLast = exports.dedupKeys = exports.dedup = exports.arraysEqual = exports.withoutNil = exports.replaceItem = exports.removeItem = exports.addItem = void 0;
const addItem = (arr, item) => {
    if (arr.indexOf(item) === -1) {
        arr.push(item);
        return true;
    }
    return false;
};
exports.addItem = addItem;
const removeItem = (arr, item) => {
    const index = arr.indexOf(item);
    if (index !== -1) {
        arr.splice(index, 1);
    }
    return index;
};
exports.removeItem = removeItem;
const replaceItem = (arr, oldItem, newItem, pushIfNotFound) => {
    const index = arr.indexOf(oldItem);
    if (index === -1) {
        // not found
        if (pushIfNotFound) {
            arr.push(newItem);
            return arr.length - 1;
        }
    }
    else {
        // found
        arr[index] = newItem;
    }
    return index;
};
exports.replaceItem = replaceItem;
const withoutNil = (arr) => arr.filter((x) => x != null);
exports.withoutNil = withoutNil;
const arraysEqual = (a1, a2, itemsEqual) => {
    if (a1 === a2)
        return true;
    if (a1.length !== a2.length)
        return false;
    if (itemsEqual) {
        for (let i = 0, l = a1.length; i < l; i += 1) {
            if (!itemsEqual(a1[i], a2[i]))
                return false;
        }
    }
    else {
        for (let i = 0, l = a1.length; i < l; i += 1) {
            if (a1[i] !== a2[i])
                return false;
        }
    }
    return true;
};
exports.arraysEqual = arraysEqual;
const dedup = (arr, toId) => {
    if (arr.length <= 1)
        return arr.slice();
    const ids = {};
    return arr.filter((item) => {
        const id = toId(item);
        if (ids[id] === 1)
            return false;
        ids[id] = 1;
        return true;
    });
};
exports.dedup = dedup;
const dedupKeys = (arr) => {
    if (arr.length <= 1)
        return arr.slice();
    const ids = {};
    return arr.filter((item) => {
        if (ids[item] === 1)
            return false;
        ids[item] = 1;
        return true;
    });
};
exports.dedupKeys = dedupKeys;
const findLast = (arr, predicate) => {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
        const item = arr[i];
        if (predicate(item, i, arr)) {
            return item;
        }
    }
    return undefined;
};
exports.findLast = findLast;
const findLastIndex = (arr, predicate) => {
    for (let i = arr.length - 1; i >= 0; i -= 1) {
        const item = arr[i];
        if (predicate(item, i, arr)) {
            return i;
        }
    }
    return -1;
};
exports.findLastIndex = findLastIndex;
const emptyToNull = (arr) => arr.length ? arr : null;
exports.emptyToNull = emptyToNull;
const moveItem = (arr, index, delta) => {
    if (arr.length <= 1)
        return arr;
    let newIndex = index + delta;
    newIndex =
        newIndex <= 0 ? 0 : newIndex >= arr.length - 1 ? arr.length - 1 : newIndex;
    if (newIndex === index)
        return arr;
    const [item] = arr.splice(index, 1);
    arr.splice(newIndex, 0, item);
    return arr;
};
exports.moveItem = moveItem;
const keysToMap = (arr, val) => {
    const map = {};
    for (let i = 0, il = arr.length; i < il; i += 1) {
        map[arr[i]] = val;
    }
    return map;
};
exports.keysToMap = keysToMap;
const arrayToMap = (arr, getKey) => {
    const map = {};
    for (let i = 0, il = arr.length; i < il; i += 1) {
        const item = arr[i];
        map[getKey(item)] = item;
    }
    return map;
};
exports.arrayToMap = arrayToMap;
// a - b
const keysSubtract = (a, b) => {
    if (!a.length || !b.length)
        return a.slice();
    const bMap = (0, exports.keysToMap)(b, 1);
    return a.filter((x) => bMap[x] !== 1);
};
exports.keysSubtract = keysSubtract;
const arraySubtract = (a, b, getKey) => {
    if (!a.length || !b.length)
        return a.slice();
    const bMap = (0, exports.arrayToMap)(b, getKey);
    return a.filter((x) => !(getKey(x) in bMap));
};
exports.arraySubtract = arraySubtract;
const keysIntersection = (a, b) => {
    if (!a.length || !b.length)
        return [];
    const bMap = (0, exports.keysToMap)(b, 1);
    return a.filter((x) => bMap[x] === 1);
};
exports.keysIntersection = keysIntersection;
const arrayIntersection = (a, b, getKey) => {
    if (!a.length || !b.length)
        return [];
    const bMap = (0, exports.arrayToMap)(b, getKey);
    return a.filter((x) => getKey(x) in bMap);
};
exports.arrayIntersection = arrayIntersection;
const arrayToKeys = (list, map) => {
    const obj = {};
    for (let i = 0, il = list.length; i < il; i += 1) {
        const item = list[i];
        obj[item] = map(item, i, list);
    }
    return obj;
};
exports.arrayToKeys = arrayToKeys;
const arrayMutate = (out, arr, mutate) => {
    for (let i = 0, il = arr.length; i < il; i += 1) {
        mutate(out, arr[i], i, arr);
    }
    return out;
};
exports.arrayMutate = arrayMutate;
