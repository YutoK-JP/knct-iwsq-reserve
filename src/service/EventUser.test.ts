import { addHours } from "date-fns";
import { nanoid } from "nanoid";
import { describe, test, expect, vi } from "vitest";
import { EventHelper } from "./EventHelper";
import { EventUserHelper } from "./EventUserHelper";
import { applicantsToParticipants } from "./EventUser";

describe("applicantsToParticipants", () => {
  test("after start", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, -1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U1.id }] },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U2.id },
            { cancel_token: nanoid(), eventUserId: U3.id },
          ],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("No events were found to process.");
  });

  test("before start: can participant", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: { data: [{ cancel_token: nanoid(), eventUserId: U1.id }] },
      },
      Applicant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U2.id },
            { cancel_token: nanoid(), eventUserId: U3.id },
          ],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe("success");
    expect(result.result?.map((v) => v.id)).toEqual([U2.id]);
  });

  test("before start: can not participant", async () => {
    const now = new Date("2023-01-01T13:00:00.000Z");
    vi.setSystemTime(now);

    const U1 = await EventUserHelper.create({ id: "U1" });
    const U2 = await EventUserHelper.create({ id: "U2" });
    const U3 = await EventUserHelper.create({ id: "U3" });
    await EventHelper.create({
      id: "EV1",
      attendance_limit: 2,
      start_time: addHours(now, 1),
      end_time: addHours(now, 3),
      Participant: {
        createMany: {
          data: [
            { cancel_token: nanoid(), eventUserId: U1.id },
            { cancel_token: nanoid(), eventUserId: U2.id },
          ],
        },
      },
      Applicant: {
        createMany: {
          data: [{ cancel_token: nanoid(), eventUserId: U3.id }],
        },
      },
    });

    const result = await applicantsToParticipants();
    expect(result.ok).toBe(true);
    expect(result.message).toBe(
      "No shouldApplicantToParticipateEvents were found to process."
    );
  });
});