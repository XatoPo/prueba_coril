# Especificación de API REST - Gestión de Portafolio

## 1. Obtener Saldos Consolidados
* **Endpoint:** `GET /api/v1/investors/{investorId}/balances`
* **Descripción:** Retorna la posición financiera actual del cliente, consolidada por fondo. Solo refleja transacciones ejecutadas.
* **Respuesta Exitosa (200 OK):**
  ```json
  [
    {
      "id": 1,
      "fundId": "FND-001",
      "fundName": "Coril Efectivo Soles FM",
      "totalShares": 240.0000,
      "investedAmount": 2400.0000,
      "currency": "PEN",
      "lastUpdated": "2024-05-25T10:00:00"
    }
  ]
  ```

## 2. Obtener Historial de Movimientos
* **Endpoint:** `GET /api/v1/investors/{investorId}/movements`
* **Query Params:** `status` (Opcional - Valores: `PENDING`, `EXECUTED`, `REJECTED`).
* **Descripción:** Retorna el historial de operaciones del inversionista, ordenado cronológicamente de forma descendente.
* **Respuesta Exitosa (200 OK):**
    ```json
    [
        {
            "id": 100,
            "fundId": "FND-001",
            "fundName": "Coril Efectivo Soles FM",
            "type": "SUBSCRIPTION",
            "amount": 150.0000,
            "shares": 0.0000,
            "shareValue": 0.0000,
            "currency": "PEN",
            "status": "PENDING",
            "transactionDate": "2024-05-25T15:30:00"
        }
    ]
    ```

## 3. Manejo Global de Errores

Cualquier error de validación o parámetro mal formado es interceptado por la API para devolver una estructura unificada:

```json
{
  "code": "INVALID_PARAMETER",
  "message": "El parámetro proporcionado no es válido",
  "timestamp": "2024-05-25T15:35:00"
}
```