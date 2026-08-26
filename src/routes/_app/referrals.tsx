import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  DataTable,
  EmptyState,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Panel,
  PanelBody,
  PanelHeader,
  RecordCard,
  RecordField,
  RecordList,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Toolbar,
} from "@/components/ui-portal";
import { apiGet, buildApiPath } from "@/lib/api";
import { formatDateTime } from "@/lib/formatters";
import type { ReferralRow } from "@/lib/types";

export const Route = createFileRoute("/_app/referrals")({
  head: () => ({
    meta: [
      { title: "Referrals - Rerkdee Admin" },
      {
        name: "description",
        content: "Review referral claims and flag unusual invite bursts.",
      },
    ],
  }),
  component: ReferralsPage,
});

function ReferralsPage() {
  const [search, setSearch] = useState("");

  const referralsQuery = useQuery({
    queryKey: ["referrals", search],
    queryFn: () =>
      apiGet<{ items: ReferralRow[] }>(buildApiPath("/referrals", { search })),
  });

  const rows = referralsQuery.data?.items ?? [];
  const flaggedCount = rows.filter((row) => row.flagged).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Referrals"
        subtitle="ตรวจสอบการใช้รหัสแนะนำและจับตาผู้ชวนที่มีอัตราการเชิญผิดปกติ"
        actions={
          flaggedCount > 0 ? (
            <StatusBadge variant="warning">ผิดปกติ {flaggedCount} รายการ</StatusBadge>
          ) : (
            <StatusBadge variant="neutral" dot={false}>
              ไม่มีรายการผิดปกติ
            </StatusBadge>
          )
        }
      />

      {referralsQuery.isError ? (
        <InlineAlert variant="danger" title="โหลดรายการ referral ไม่สำเร็จ">
          ลองรีเฟรชหน้านี้อีกครั้ง
        </InlineAlert>
      ) : null}

      <Panel>
        <PanelHeader
          title="รายการที่เคลม referral"
          description="แถวที่มีสัญลักษณ์ 'ผิดปกติ' คือผู้ชวนที่มีการเคลม referral จำนวนมากในช่วงเวลาสั้น ๆ (ค่าเริ่มต้น: 5 ครั้งขึ้นไปภายใน 24 ชั่วโมง) — ใช้เป็นจุดเริ่มตรวจสอบ ไม่ใช่การบล็อกอัตโนมัติ"
        />
        <PanelBody className="px-0 py-0">
          <Toolbar
            left={
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ค้นหาด้วย user id หรือรหัส referral"
                className="w-72"
              />
            }
            right={
              <span className="text-[12px] text-muted-foreground tabular-nums">
                {rows.length} รายการ
              </span>
            }
          />

          {referralsQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-44" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="ไม่พบรายการ"
                description="ไม่มี referral ที่ตรงกับคำค้นหา"
              />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH>ผู้ชวน</TH>
                  <TH>ผู้ถูกชวน</TH>
                  <TH>รหัส</TH>
                  <TH>เคลมเมื่อ</TH>
                  <TH>ได้รับสิทธิ์แล้ว</TH>
                  <TH className="text-right">ความถี่ผู้ชวน</TH>
                  <TH>สถานะ</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <TR key={row.referred_user_id} selected={row.flagged}>
                    <TD>
                      <Link
                        to="/users/$userId"
                        params={{ userId: row.inviter_user_id }}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {row.inviter_user_id}
                      </Link>
                    </TD>
                    <TD>
                      <Link
                        to="/users/$userId"
                        params={{ userId: row.referred_user_id }}
                        className="font-mono text-xs text-primary hover:underline"
                      >
                        {row.referred_user_id}
                      </Link>
                    </TD>
                    <TD className="font-mono">{row.referral_code}</TD>
                    <TD className="text-muted-foreground">{formatDateTime(row.claimed_at)}</TD>
                    <TD className="text-muted-foreground">
                      {row.premium_awarded_at ? formatDateTime(row.premium_awarded_at) : "—"}
                    </TD>
                    <TD className="text-right tabular-nums">{row.inviter_burst_count}</TD>
                    <TD>
                      {row.flagged ? (
                        <StatusBadge variant="warning">ผิดปกติ</StatusBadge>
                      ) : (
                        <StatusBadge variant="active">ปกติ</StatusBadge>
                      )}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </DataTable>
          )}

          {!referralsQuery.isLoading && rows.length > 0 ? (
            <RecordList>
              {rows.map((row) => (
                <RecordCard key={row.referred_user_id}>
                  <RecordField>
                    <span className="min-w-0 truncate font-mono font-medium text-foreground">
                      {row.inviter_user_id}
                    </span>
                    {row.flagged ? (
                      <StatusBadge variant="warning">ผิดปกติ</StatusBadge>
                    ) : (
                      <StatusBadge variant="active">ปกติ</StatusBadge>
                    )}
                  </RecordField>
                  <RecordField label="ผู้ถูกชวน">{row.referred_user_id}</RecordField>
                  <RecordField label="รหัส">{row.referral_code}</RecordField>
                  <RecordField label="เคลมเมื่อ">{formatDateTime(row.claimed_at)}</RecordField>
                  <RecordField label="ความถี่ผู้ชวน">
                    <span className="tabular-nums">{row.inviter_burst_count}</span>
                  </RecordField>
                </RecordCard>
              ))}
            </RecordList>
          ) : null}
        </PanelBody>
      </Panel>
    </div>
  );
}
