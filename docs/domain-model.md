# Modelo de Dominio Financiero

El sistema modela la inversión en fondos mutuos operando sobre el concepto de **Cuotas** y **Valor Cuota**, alejándose de los saldos bancarios tradicionales.

## 1. Conceptos Core
* **Aporte (Subscription):** Inyección de capital líquido para adquirir cuotas del fondo.
* **Rescate (Redemption):** Liquidación de cuotas para obtener capital líquido.
* **Valor Cuota (Share Value):** El precio de cada cuota, el cual se calcula exclusivamente al cierre del mercado diario.

## 2. Ciclo de Vida de Transacciones (Movement)
Al no conocerse el Valor Cuota en tiempo real durante el día operativo, las transacciones poseen un flujo estricto:
* **PENDING:** La operación ingresó y está en tránsito esperando el cálculo del valor cuota al cierre. Sus cuotas (`shares`) son cero y no altera la posición contable.
* **EXECUTED:** El cierre de mercado procesó la transacción. Se asignan las cuotas exactas y se actualiza el saldo global.
* **REJECTED:** La transacción es denegada (ej. sin fondos u observaciones de cumplimiento) sin impacto contable.

## 3. Posición Global (Balance)
Para garantizar un alto rendimiento en la lectura de la vista principal, el sistema aísla la posición actual (`Balance`) del registro histórico (`Movement`). El Balance refleja únicamente la matemática exacta de las transacciones `EXECUTED`.