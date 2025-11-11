import { FormEvent, useMemo, useState } from "react";
import { formatCurrency } from "../utils/formatters";

const fieldClass =
  "w-full rounded-xl border border-logica-lilac/40 bg-white px-4 py-3 text-sm text-logica-purple focus:border-logica-purple focus:outline-none";

type SimulationResult = {
  installmentValue: number;
  interestPerInstallment: number;
  totalInterest: number;
  totalAmount: number;
};

function simulateLoan(value: number, installments: number, rate: number): SimulationResult {
  const monthlyRate = rate / 100;
  const installmentValue = (value * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -installments));
  const totalAmount = installmentValue * installments;
  const totalInterest = totalAmount - value;
  const interestPerInstallment = totalInterest / installments;
  return {
    installmentValue,
    interestPerInstallment,
    totalInterest,
    totalAmount
  };
}

export function SimulationView() {
  const [amount, setAmount] = useState(100000);
  const [installments, setInstallments] = useState(24);
  const [rate, setRate] = useState(1.25);
  const [upfrontValue, setUpfrontValue] = useState(50000);

  const result = useMemo(() => simulateLoan(amount, installments, rate), [amount, installments, rate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold text-logica-purple">Simulação</h1>
        <p className="text-sm text-logica-lilac">
          Ajuste os parâmetros para avaliar cenários de contratação de empréstimo.
        </p>
      </header>
      <section className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
          <div>
            <label className="text-sm text-logica-purple">
              Valor desejado (R$)
              <input
                type="number"
                min={1000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
                className={fieldClass}
              />
            </label>
          </div>
          <div>
            <label className="text-sm text-logica-purple">
              Parcelas
              <input
                type="number"
                min={1}
                value={installments}
                onChange={(event) => setInstallments(Number(event.target.value))}
                className={fieldClass}
              />
            </label>
          </div>
          <div>
            <label className="text-sm text-logica-purple">
              Taxa de juros mensal (%)
              <input
                type="number"
                step={0.01}
                min={0.01}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
                className={fieldClass}
              />
            </label>
          </div>
          <div>
            <label className="text-sm text-logica-purple">
              Entrada (R$)
              <input
                type="number"
                min={0}
                value={upfrontValue}
                onChange={(event) => setUpfrontValue(Number(event.target.value))}
                className={fieldClass}
              />
            </label>
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-logica-rose px-4 py-2 text-sm font-semibold text-white shadow hover:bg-logica-purple"
          >
            Calcular
          </button>
        </form>
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-logica-purple/20 bg-white/90 p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-logica-purple">Resumo</h2>
            <ul className="mt-4 space-y-2 text-sm text-logica-purple">
              <li className="flex justify-between">
                <span>Valor financiado</span>
                <span className="font-semibold">{formatCurrency(amount - upfrontValue)}</span>
              </li>
              <li className="flex justify-between">
                <span>Valor da parcela</span>
                <span className="font-semibold">{formatCurrency(result.installmentValue)}</span>
              </li>
              <li className="flex justify-between">
                <span>Juros por parcela</span>
                <span className="font-semibold">{formatCurrency(result.interestPerInstallment)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total de juros</span>
                <span className="font-semibold">{formatCurrency(result.totalInterest)}</span>
              </li>
              <li className="flex justify-between">
                <span>Total a pagar</span>
                <span className="font-semibold">{formatCurrency(result.totalAmount)}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-logica-purple/20 bg-gradient-to-br from-logica-light-lilac to-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-logica-purple">Insights</h2>
            <ul className="mt-4 space-y-2 text-sm text-logica-purple">
              <li>
                O valor das parcelas representa
                <strong> {((result.installmentValue * installments) / amount).toFixed(2)}x </strong>
                o valor financiado.
              </li>
              <li>
                A entrada reduz o valor financiado para <strong>{formatCurrency(amount - upfrontValue)}</strong> e pode ser
                ajustada para equilibrar fluxo de caixa.
              </li>
              <li>
                Considere negociar a taxa de juros mensal para reduzir o total de juros de
                <strong> {formatCurrency(result.totalInterest)}</strong>.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
