import axios from "axios";

const RESERVATION_API_URL = import.meta.env.VITE_RESERVATION_API;

const API_URL = import.meta.env.VITE_DASHBOARD_API;

async function callApi(action) {

    const response = await axios.post(
        API_URL,
        {
            action
        }
    );

    return response.data;
}


export function getDashboardData() {

    return callApi("GET_DASHBOARD");
}

export function getReservations() {

    return callApi("GET_RESERVATIONS");
}

export function getTables() {

    return callApi("GET_TABLES");
}

export function getSettings() {

    return callApi("GET_SETTINGS");
}

export async function bookReservation(data) {

    const response = await axios.post(
        RESERVATION_API_URL,
        {
            action: "BOOK",
            ...data
        }
    )

    return response.data
}

export async function cancelReservation(last3Digits) {

    const response = await axios.post(
        RESERVATION_API_URL,
        {
            action: "CANCEL",
            last3: last3Digits
        }
    )

    return response.data
}

export async function rescheduleReservation(data) {

    const response = await axios.post(
        RESERVATION_API_URL,
        {
            action: "RESCHEDULE",
            ...data
        }
    )

    return response.data
}

export async function updateRestaurantStatus(isOpen) {

    const response = await axios.post(

        API_URL,

        {

            action: "UPDATE_RESTAURANT_STATUS",

            isOpen

        }

    );

    return response.data;

}