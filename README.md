# Bengkel-be — API Summary

Ringkasan singkat endpoint, schema database (Prisma), dan instruksi menjalankan proyek.

**Endpoints**

- `GET /sos/:id` — Ambil detail SOS. Handler: [src/modules/sos/sos.route.ts](src/modules/sos/sos.route.ts#L1-L7)
- `POST /sos` — Buat SOS (body: `user_id`, `vehicle_id`, `latitude`, `longitude`). Handler: [src/modules/sos/sos.route.ts](src/modules/sos/sos.route.ts#L1-L7)
- `POST /sos/:id/assign` — Auto-assign mechanic ke SOS (`:id` = sos id). Handler: [src/modules/sos/sos.route.ts](src/modules/sos/sos.route.ts#L1-L7)
- `PATCH /sos/:id/status` — Update status SOS (body: `status`). Handler: [src/modules/sos/sos.route.ts](src/modules/sos/sos.route.ts#L1-L7)

> Semua route `/sos` diregister di `src/app.ts`.

**Request body contoh**

POST /sos

```json
{
  "user_id": "uuid-user",
  "vehicle_id": "uuid-vehicle",
  "latitude": -6.200000,
  "longitude": 106.816666
}
```

PATCH /sos/:id/status

```json
{
  "status": "ASSIGNED"
}
```

Enums `SOSStatus`: `REQUESTED`, `ASSIGNED`, `ON_PROGRESS`, `DONE`, `CANCELED`.

**Database (Prisma) — ringkasan model utama**

- `user`
  - `id`, `name`, `phone` (unique), `role` (Role enum), `latitude?`, `longitude?`, `is_available?`
  - relasi: `assignment[]`, `notifications[]`, `requests[]`, `vehicles[]`

- `vehicle`
  - `id`, `user_id`, `brand`, `model`, `plate_number` (unique), `created_at`

- `sos_request`
  - `id`, `user_id`, `vehicle_id`, `latitude`, `longitude`, `status` (SOSStatus), `created_at`
  - relasi: `assignment?`, `logs[]`, `user`, `vehicle`

- `assignment`
  - `id`, `sos_request_id` (unique), `mechanic_id`, `status` (AssignmentStatus), `assigned_at`

- `service_log`, `notification` — tabel pendukung (lihat `prisma/schema.prisma`).

Lihat file schema lengkap: [prisma/schema.prisma](prisma/schema.prisma#L1-L200)

**Environment / .env (required keys)**

- `DATABASE_URL` — connection string Postgres
- `KAFKA_PRODUCER_CLIENT_ID`, `KAFKA_BROKERS`, `KAFKA_GROUP_ID` — Kafka config
- `REDIS_HOST`, `REDIS_PORT` — Redis untuk lock
- `OTEL_EXPORTER_OTLP_ENDPOINT` — (opsional) tracing/logs

Contoh file `.env` ada di repo root.

**Run (development)**

Instal dependencies lalu jalankan dev server:

```bash
npm install
npm run dev
```

Service akan terhubung ke Kafka saat start (lihat `index.ts`). Untuk migrasi/seed Prisma gunakan script `prisma`/`seed` sesuai konfigurasi proyek.

**Lokasi kode penting**

- Route SOS: [src/modules/sos/sos.route.ts](src/modules/sos/sos.route.ts#L1-L7)
- Controller/Service/Repository: [src/modules/sos/sos.controller.ts](src/modules/sos/sos.controller.ts#L1-L80), [src/modules/sos/sos.service.ts](src/modules/sos/sos.service.ts#L1-L200), [src/modules/sos/sos.repository.ts](src/modules/sos/sos.repository.ts#L1-L200)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma#L1-L200)

---

Butuh format OpenAPI (Swagger) atau export CSV tabel fields? Saya bisa generate jika mau.
# bengkel-be

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.6. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
