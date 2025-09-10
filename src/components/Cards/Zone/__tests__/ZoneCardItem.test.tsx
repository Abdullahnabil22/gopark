/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import ZoneCardItem from '../ZoneCardItem';
import { type Zone } from '../../../../services/api';
const baseZone: Zone = {
  id: 'z1',
  name: 'Zone A',
  categoryId: 'cat-1',
  open: true,
  occupied: 5,
  totalSlots: 10,
  availableForVisitors: 0,
  availableForSubscribers: 0,
  rateNormal: 2,
};

describe('ZoneCardItem', () => {
  it('disables Select Zone when zone has no available slots', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <ZoneCardItem
        zone={{ ...baseZone, open: true, availableForVisitors: 0, availableForSubscribers: 0 }}
        categoryName="Standard"
        selectedZone={{ ...baseZone }}
        onSelect={onSelect}
        isDisabled={false}
        subscriptionValid
      />
    );

    const button = screen.getByRole('button', { name: /no slots available/i });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onSelect).not.toHaveBeenCalled();
  });
});


