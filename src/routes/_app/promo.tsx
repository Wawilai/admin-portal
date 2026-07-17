import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  DataTable,
  EmptyState,
  FilterChip,
  HelperNote,
  InlineAlert,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  PanelBody,
  PanelHeader,
  PreviewRow,
  StatusBadge,
  TBody,
  TD,
  TH,
  THead,
  TR,
  Toolbar,
} from "@/components/ui-portal";
import { apiGet, apiWrite, buildApiPath, extractErrorDetail } from "@/lib/api";
import { formatDateOnly } from "@/lib/formatters";
import type { PaginatedResponse, PromoCodeRow } from "@/lib/types";

export const Route = createFileRoute("/_app/promo")({
  head: () => ({
    meta: [
      { title: "Promo codes - Rerkdee Admin" },
      {
        name: "description",
        content: "Create, inspect, and deactivate promo access codes.",
      },
    ],
  }),
  component: PromoPage,
});

const PRESETS = [
  { id: "all", label: "ทั้งหมด" },
  { id: "active", label: "ใช้งานได้" },
  { id: "expired", label: "หมดอายุ" },
  { id: "deactivated", label: "ปิดใช้งาน" },
] as const;

type Preset = (typeof PRESETS)[number]["id"];

function PromoPage() {
  const queryClient = useQueryClient();
  const [preset, setPreset] = useState<Preset>("all");
  const [page, setPage] = useState(1);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  // Backend only honours "free_days" (grants N days of Premium); the other
  // reward types were never wired into /promo/redeem, so we don't expose them.
  const discountType = "free_days";
  const [discountValue, setDiscountValue] = useState("10");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [selected, setSelected] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const promoQuery = useQuery({
    queryKey: ["promo-codes", preset, page, pageSize],
    queryFn: () =>
      apiGet<PaginatedResponse<PromoCodeRow>>(
        buildApiPath("/promo/codes", {
          preset,
          page,
          page_size: pageSize,
        }),
      ),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiWrite<{ ok: boolean }>("/promo/codes", {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        maxUses: Number(maxUses),
        expiresInDays: Number(expiresInDays),
      }),
    onSuccess: async () => {
      setFlash("สร้างโค้ดโปรโมชั่นแล้ว");
      setError(null);
      setCode("");
      setDescription("");
      setDiscountValue("10");
      setMaxUses("1");
      setExpiresInDays("30");
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "สร้างโค้ดไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (codeId: number) =>
      apiWrite<{ ok: boolean }>(`/promo/codes/${codeId}/deactivate`, {}),
    onSuccess: async () => {
      setFlash("ปิดใช้งานโค้ดแล้ว");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ปิดใช้งานโค้ดไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const bulkDeactivateMutation = useMutation({
    mutationFn: (codeIds: number[]) =>
      apiWrite<{ ok: boolean; affected: number }>("/promo/codes/bulk-deactivate", {
        codeIds,
      }),
    onSuccess: async (result) => {
      setFlash(`ปิดใช้งานโค้ดแล้ว ${result.affected} รายการ`);
      setError(null);
      setSelected([]);
      await queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (mutationError) => {
      setError(extractErrorDetail(mutationError, "ปิดใช้งานหลายรายการไม่สำเร็จ"));
      setFlash(null);
    },
  });

  const rows = promoQuery.data?.items ?? [];
  const total = promoQuery.data?.total ?? 0;
  const rewardSummary = `Premium ฟรี ${discountValue || 0} วัน`;
  const limitSummary =
    Number(maxUses) > 0 ? `ใช้ได้ ${maxUses} ครั้ง` : "ใช้ได้ไม่จำกัด";
  const expirySummary =
    Number(expiresInDays) > 0 ? `โค้ดหมดอายุใน ${expiresInDays} วัน` : "ไม่มีวันหมดอายุ";
  const canCreate =
    code.trim().length > 0 &&
    Number(discountValue) > 0 &&
    Number(maxUses) >= 0 &&
    Number(expiresInDays) >= 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="โค้ดโปรโมชั่น"
        subtitle="สร้างและจัดการโค้ดสำหรับแจกสิทธิ์ Premium ฟรี"
        actions={
          <span className="text-[11px] text-muted-foreground tabular-nums">
            ทั้งหมด {total.toLocaleString()} โค้ด
          </span>
        }
      />

      {flash ? <InlineAlert variant="success">{flash}</InlineAlert> : null}
      {error ? <InlineAlert variant="danger">{error}</InlineAlert> : null}
      {promoQuery.isError ? (
        <InlineAlert variant="danger" title="โหลดรายการโค้ดไม่สำเร็จ">
          ขณะนี้ยังเชื่อมต่อระบบไม่ได้ ดูฟอร์มได้ตามปกติ แต่ยังไม่ควรสร้างโค้ดใหม่จนกว่าระบบจะกลับมาทำงาน
        </InlineAlert>
      ) : null}

      <Panel>
        <PanelHeader
          title="สร้างโค้ดใหม่"
          description="โค้ดโปรโมชั่นจะให้สิทธิ์ Premium ฟรีตามจำนวนวันที่กำหนด ผู้ใช้กรอกโค้ดในแอปเพื่อรับสิทธิ์ — เลือกชุดสำเร็จรูปด้านล่างเพื่อกรอกค่าให้อัตโนมัติ"
        />
        <PanelBody className="flex flex-col gap-5">
          <HelperNote>
            <div className="flex flex-col gap-1.5">
              <PreviewRow label="สิทธิ์ที่ได้รับ" value={rewardSummary} />
              <PreviewRow label="จำนวนครั้งที่ใช้ได้" value={limitSummary} />
              <PreviewRow label="อายุของโค้ด" value={expirySummary} />
            </div>
          </HelperNote>

          <div className="flex flex-wrap gap-2">
            <QuickActionButton
              label="ทดลอง 10 วัน (1 คน)"
              onClick={() => {
                setDiscountValue("10");
                setMaxUses("1");
                setExpiresInDays("30");
              }}
            />
            <QuickActionButton
              label="แคมเปญ 30 วัน (100 คน)"
              onClick={() => {
                setDiscountValue("30");
                setMaxUses("100");
                setExpiresInDays("14");
              }}
            />
            <QuickActionButton
              label="Premium 7 วัน (ไม่จำกัดคน)"
              onClick={() => {
                setDiscountValue("7");
                setMaxUses("0");
                setExpiresInDays("0");
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="โค้ด">
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="เช่น RERK001"
                className="h-9 w-full rounded-md border border-border bg-background px-3 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="คำอธิบาย (ภายใน)">
              <input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="บันทึกของแอดมิน เช่น ชื่อแคมเปญ"
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="จำนวนวัน Premium ฟรี">
              <input
                type="number"
                min="1"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="ใช้ได้กี่ครั้ง (0 = ไม่จำกัด)">
              <input
                type="number"
                min="0"
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="โค้ดหมดอายุใน (วัน, 0 = ไม่หมด)">
              <input
                type="number"
                min="0"
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(event.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </Field>
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,0.7fr)]">
            <HelperNote>
              <strong className="text-foreground">จำนวนวัน Premium ฟรี</strong> = ระยะเวลาที่ผู้ใช้จะได้สิทธิ์หลังกรอกโค้ด ·
              <strong className="text-foreground"> ใช้ได้กี่ครั้ง</strong> ใส่ <code>0</code> เพื่อให้ใช้ได้ไม่จำกัดคน ·
              <strong className="text-foreground"> โค้ดหมดอายุ</strong> ใส่ <code>0</code> เพื่อให้โค้ดใช้ได้จนกว่าจะปิดเอง
            </HelperNote>
            <div className="flex items-center xl:justify-end">
              <button
                type="button"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !canCreate}
                className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 xl:w-auto"
              >
                {createMutation.isPending ? "กำลังสร้าง..." : "สร้างโค้ด"}
              </button>
            </div>
          </div>
        </PanelBody>
      </Panel>

      <Panel>
        <PanelHeader
          title="โค้ดที่มีอยู่"
          description="ดูสถานะการใช้งานและปิดโค้ดที่ไม่ต้องการให้ใช้ได้อีก"
        />
        <PanelBody className="px-0 py-0">
          <Toolbar
            left={
              <div className="flex flex-wrap items-center gap-2">
                {PRESETS.map((item) => (
                  <FilterChip
                    key={item.id}
                    active={preset === item.id}
                    onClick={() => {
                      setPreset(item.id);
                      setPage(1);
                    }}
                  >
                    {item.label}
                  </FilterChip>
                ))}
              </div>
            }
            right={
              selected.length > 0 ? (
                <button
                  type="button"
                  onClick={() => bulkDeactivateMutation.mutate(selected)}
                  disabled={bulkDeactivateMutation.isPending}
                  className="inline-flex h-8 items-center rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive hover:bg-destructive/15 disabled:opacity-50"
                >
                  {bulkDeactivateMutation.isPending ? "กำลังปิด..." : `ปิด ${selected.length} โค้ด`}
                </button>
              ) : (
                <span className="text-[12px] text-muted-foreground tabular-nums">
                  {total} โค้ด
                </span>
              )
            }
          />

          {promoQuery.isLoading ? (
            <div className="p-5">
              <LoadingSkeleton className="h-44" />
            </div>
          ) : rows.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState
                title="ยังไม่มีโค้ด"
                description="ไม่มีโค้ดที่ตรงกับตัวกรองที่เลือก"
              />
            </div>
          ) : (
            <DataTable>
              <THead>
                <TR>
                  <TH className="w-10">เลือก</TH>
                  <TH>โค้ด</TH>
                  <TH>สิทธิ์ที่ได้</TH>
                  <TH className="text-right">ใช้ไปแล้ว</TH>
                  <TH>จำกัดครั้ง</TH>
                  <TH>หมดอายุ</TH>
                  <TH>สถานะ</TH>
                  <TH className="text-right">จัดการ</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const checked = row.id ? selected.includes(row.id) : false;
                  return (
                    <TR key={row.code} selected={checked}>
                      <TD>
                        {row.id ? (
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelected((current) =>
                                checked
                                  ? current.filter((item) => item !== row.id)
                                  : [...current, row.id!],
                              )
                            }
                          />
                        ) : null}
                      </TD>
                      <TD className="font-mono">{row.code}</TD>
                      <TD>{row.rewardLabel}</TD>
                      <TD className="text-right tabular-nums">{row.usedCount}</TD>
                      <TD>{row.maxUses ?? "ไม่จำกัด"}</TD>
                      <TD className="text-muted-foreground">{formatDateOnly(row.expiresAt)}</TD>
                      <TD>
                        {row.active ? (
                          <StatusBadge variant="active">ใช้งานได้</StatusBadge>
                        ) : (
                          <StatusBadge variant="expired">ปิดใช้งาน</StatusBadge>
                        )}
                      </TD>
                      <TD className="text-right">
                        {row.id ? (
                          <button
                            type="button"
                            onClick={() => deactivateMutation.mutate(row.id!)}
                            disabled={!row.active}
                            className="inline-flex h-7 items-center rounded-md border border-border bg-card px-2 text-[11px] text-foreground hover:bg-muted disabled:opacity-40"
                          >
                            ปิดใช้งาน
                          </button>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </DataTable>
          )}

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </PanelBody>
      </Panel>
    </div>
  );
}

function QuickActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-[12px] font-medium text-foreground hover:bg-muted"
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
