import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import {
  Button,
  DataTable,
  EmptyState,
  Field,
  FilterChip,
  HelperNote,
  InlineAlert,
  Input,
  LoadingSkeleton,
  PageHeader,
  Pagination,
  Panel,
  PanelBody,
  PanelHeader,
  PreviewRow,
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
            <Button
              size="sm"
              onClick={() => {
                setDiscountValue("10");
                setMaxUses("1");
                setExpiresInDays("30");
              }}
            >
              ทดลอง 10 วัน (1 คน)
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDiscountValue("30");
                setMaxUses("100");
                setExpiresInDays("14");
              }}
            >
              แคมเปญ 30 วัน (100 คน)
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setDiscountValue("7");
                setMaxUses("0");
                setExpiresInDays("0");
              }}
            >
              Premium 7 วัน (ไม่จำกัดคน)
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="โค้ด">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="เช่น RERK001"
                className="font-mono"
              />
            </Field>
            <Field label="คำอธิบาย (ภายใน)">
              <Input
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="บันทึกของแอดมิน เช่น ชื่อแคมเปญ"
              />
            </Field>
            <Field label="จำนวนวัน Premium ฟรี">
              <Input
                type="number"
                min="1"
                value={discountValue}
                onChange={(event) => setDiscountValue(event.target.value)}
              />
            </Field>
            <Field label="ใช้ได้กี่ครั้ง (0 = ไม่จำกัด)">
              <Input
                type="number"
                min="0"
                value={maxUses}
                onChange={(event) => setMaxUses(event.target.value)}
              />
            </Field>
            <Field label="โค้ดหมดอายุใน (วัน, 0 = ไม่หมด)">
              <Input
                type="number"
                min="0"
                value={expiresInDays}
                onChange={(event) => setExpiresInDays(event.target.value)}
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
              <Button
                variant="primary"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !canCreate}
                className="w-full xl:w-auto"
              >
                {createMutation.isPending ? "กำลังสร้าง..." : "สร้างโค้ด"}
              </Button>
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
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => bulkDeactivateMutation.mutate(selected)}
                  disabled={bulkDeactivateMutation.isPending}
                >
                  {bulkDeactivateMutation.isPending ? "กำลังปิด..." : `ปิด ${selected.length} โค้ด`}
                </Button>
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
                          <Button size="sm" onClick={() => deactivateMutation.mutate(row.id!)} disabled={!row.active}>
                            ปิดใช้งาน
                          </Button>
                        ) : null}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </DataTable>
          )}

          {!promoQuery.isLoading && rows.length > 0 ? (
            <RecordList>
              {rows.map((row) => (
                <RecordCard key={row.code}>
                  <RecordField>
                    <span className="min-w-0 truncate font-mono font-medium text-foreground">{row.code}</span>
                    {row.active ? (
                      <StatusBadge variant="active">ใช้งานได้</StatusBadge>
                    ) : (
                      <StatusBadge variant="expired">ปิดใช้งาน</StatusBadge>
                    )}
                  </RecordField>
                  <RecordField label="สิทธิ์ที่ได้">{row.rewardLabel}</RecordField>
                  <RecordField label="ใช้ไปแล้ว">
                    <span className="tabular-nums">{row.usedCount}</span>
                  </RecordField>
                  <RecordField label="จำกัดครั้ง">{row.maxUses ?? "ไม่จำกัด"}</RecordField>
                  <RecordField label="หมดอายุ">{formatDateOnly(row.expiresAt)}</RecordField>
                  {row.id ? (
                    <div className="border-t border-border/70 pt-2">
                      <Button size="sm" onClick={() => deactivateMutation.mutate(row.id!)} disabled={!row.active}>
                        ปิดใช้งาน
                      </Button>
                    </div>
                  ) : null}
                </RecordCard>
              ))}
            </RecordList>
          ) : null}

          <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        </PanelBody>
      </Panel>
    </div>
  );
}
