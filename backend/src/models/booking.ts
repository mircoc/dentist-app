import { Entity } from "dynamodb-toolbox";
import { BaseSchema } from ".";
import { Booking } from "../typings/model/booking";

export type BookingSchema = BaseSchema & Booking;

export type BookingEntity = Entity<BookingSchema>;

