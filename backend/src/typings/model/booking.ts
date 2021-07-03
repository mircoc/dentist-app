export interface Booking {
    dateTime: string;
    userName: string;
}

export interface BookingCreationBody {
    userName: string;
    hour: number;
};

export interface BookingCreationParam {
    year: number;
    month: number;
    day: number;
};

export interface BookingUpdateBody {
    year: number;
    month: number;
    day: number;
    hour: number;
    userName: string;
}