import { describe, it, expect } from 'vitest';
import { calculateTotalPrice, calculateInstallment, formatPrice, CarConfiguration } from './configuratorStore';

describe('configuratorStore pure functions', () => {
  describe('calculateTotalPrice', () => {
    it('should calculate the base price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(40000);
    });

    it('should add sport wheels price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };
      expect(calculateTotalPrice(config)).toBe(42000);
    });

    it('should add optionals price correctly', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['precision-park', 'flux-capacitor'],
      };
      // 40000 + 5500 + 5000 = 50500
      expect(calculateTotalPrice(config)).toBe(50500);
    });
  });

  describe('calculateInstallment', () => {
    it('should calculate 12x installments with 2% monthly interest correctly', () => {
      const total = 40000;
      const installment = calculateInstallment(total);
      expect(installment).toBe(3782.38);
    });
  });

  describe('formatPrice', () => {
    it('should format price correctly to BRL currency', () => {
      const formatted = formatPrice(40000);
      // Remove whitespace characters (including non-breaking spaces) for simpler assertion
      expect(formatted.replace(/\s/g, '')).toBe('R$40.000,00');
    });
  });
});
