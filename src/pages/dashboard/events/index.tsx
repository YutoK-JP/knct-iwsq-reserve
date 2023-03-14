import type { NextPage } from "next";
import useSWR from "swr";
import { Dashboard } from "../../../layouts/dashboard";
import { formatISO9075 } from "date-fns";
import { useStyletron } from "baseui";
import {
  StatefulDataTable,
  NumericalColumn,
  StringColumn,
  CustomColumn,
} from "baseui/data-table";
import { Link } from "../../../components/baseui/Link";
import { useTrpc } from "../../../trpc";
import { AppRouterOutput } from "../../../server/routers";

type Event = AppRouterOutput["events"]["get"][number];

const columns = [
  StringColumn({
    title: "イベント名",
    mapDataToValue: (data: Event) => data.name,
  }),
  StringColumn({
    title: "開始時間",
    mapDataToValue: (data: Event) => formatISO9075(new Date(data.start_time)),
  }),
  StringColumn({
    title: "終了時間",
    mapDataToValue: (data: Event) => formatISO9075(new Date(data.end_time)),
  }),
  NumericalColumn({
    title: "制限人数",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "申込数",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  NumericalColumn({
    title: "キャンセル待ち",
    mapDataToValue: (data: Event) => data.attendance_limit,
  }),
  StringColumn({
    title: "開催者",
    mapDataToValue: (data: Event) => data.organizer?.name ?? "",
  }),
  CustomColumn<{ id: Event["id"] }, {}>({
    title: "その他",
    mapDataToValue: (data: Event) => ({
      id: data.id,
    }),
    renderCell: function Cell(props) {
      return (
        <Link href={`/dashboard/events/${props.value.id}`}>詳細を見る</Link>
      );
    },
  }),
];

const EventsPage: NextPage = () => {
  const [css] = useStyletron();
  const trpc = useTrpc();
  const { data, error, isLoading } = useSWR("events", () => {
    return trpc.events.get.query();
  });

  if (error) {
    console.log("error", error);
  }

  return (
    <Dashboard>
      <div className={css({ height: "800px", width: "100%" })}>
        <StatefulDataTable
          columns={columns}
          rows={(data ?? []).map((v: any) => ({ id: v.id, data: v }))}
          loading={isLoading}
          loadingMessage="読み込み中"
          emptyMessage="イベントは見つかりませんでした"
        />
      </div>
    </Dashboard>
  );
};

export default EventsPage;
