import { useMemo, type DependencyList } from "react";

const validCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const randomString = (length: number = 12): string => {
    return Array.from(new Array(length)).map(() => validCharacters[Math.floor(Math.random() * validCharacters.length)]).join("");
}

export const useElementId = (deps: DependencyList) => useMemo(() => randomString(), deps);