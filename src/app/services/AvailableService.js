import {
    parseISO, startOfDay, endOfDay,
    setHours, setMinutes, setSeconds, format, isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import { zonedTimeToUtc } from 'date-fns-tz';
import Appointment from '../models/Appointment';

class AvailableService {
    async run({ date, provider_id }) {
        const searchDate = zonedTimeToUtc(parseISO(date), 'America/Sao_Paulo');

        const appointments = await Appointment.findAll({
            where: {
                provider_id,
                canceled_at: null,
                date: {
                    [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
                },
            },
        });

        const schedule = [
            '08:00',
            '09:00',
            '10:00',
            '11:00',
            '12:00',
            '13:00',
            '14:00',
            '15:00',
            '16:00',
            '17:00',
            '18:00',
            '19:00',
        ];

        const requestDate = parseISO(date);

        const available = schedule.map((time) => {
            const [hour, minute] = time.split(':');
            const value = setSeconds(setMinutes(setHours(requestDate, hour), minute), 0);

            const compareDate = zonedTimeToUtc(value, 'America/Sao_Paulo');

            return {
                time,
                value: format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                available: isAfter(compareDate, new Date())
                && !appointments.find((a) => format(a.date, 'HH:mm') === time),
            };
        });

        return available;
    }
}

export default new AvailableService();
