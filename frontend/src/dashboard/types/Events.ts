import React from "react";

export type ButtonClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;

export type Click<T> = (event: React.MouseEvent<T, MouseEvent>) => void;

export type InputChange = (event: React.ChangeEvent<HTMLInputElement>) => void;
