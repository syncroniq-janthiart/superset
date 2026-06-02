/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@superset-ui/core/spec';
import ColumnSelectorDropdown from '../src/DataTable/components/ColumnSelectorDropdown';
import { ProviderWrapper } from './testHelpers';

const TWO_COLS = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta' },
];
const THREE_COLS = [
  { key: 'a', label: 'Alpha' },
  { key: 'b', label: 'Beta' },
  { key: 'c', label: 'Gamma' },
];

function renderDropdown(
  columns = TWO_COLS,
  hiddenColumns = new Set<string>(),
  onChange = jest.fn(),
) {
  return render(
    ProviderWrapper({
      children: (
        <ColumnSelectorDropdown
          columns={columns}
          hiddenColumns={hiddenColumns}
          onChange={onChange}
        />
      ),
    }),
  );
}

async function openDropdown() {
  fireEvent.click(screen.getByRole('button', { name: 'Show/hide columns' }));
  return screen.findAllByRole('checkbox');
}

test('trigger button is rendered', () => {
  renderDropdown();
  expect(
    screen.getByRole('button', { name: 'Show/hide columns' }),
  ).toBeInTheDocument();
});

test('all columns are shown as checked by default', async () => {
  renderDropdown();
  const checkboxes = await openDropdown();
  expect(checkboxes).toHaveLength(TWO_COLS.length);
  checkboxes.forEach(cb => expect(cb).toBeChecked());
});

test('unchecking a column calls onChange with it in the hidden set', async () => {
  const onChange = jest.fn();
  renderDropdown(TWO_COLS, new Set(), onChange);
  await openDropdown();

  fireEvent.click(screen.getByRole('checkbox', { name: 'Beta' }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenCalledWith(new Set(['b']));
});

test('rechecking a hidden column calls onChange with it removed from hidden set', async () => {
  const onChange = jest.fn();
  renderDropdown(TWO_COLS, new Set(['b']), onChange);
  await openDropdown();

  const betaCheckbox = screen.getByRole('checkbox', { name: 'Beta' });
  expect(betaCheckbox).not.toBeChecked();
  fireEvent.click(betaCheckbox);
  expect(onChange).toHaveBeenCalledWith(new Set());
});

test('last visible checkbox is disabled with an explanatory title', async () => {
  renderDropdown([{ key: 'a', label: 'Alpha' }], new Set());
  const checkboxes = await openDropdown();
  expect(checkboxes[0]).toBeChecked();
  expect(checkboxes[0]).toBeDisabled();

  // rc-checkbox strips title from the input; it lives on the wrapper span instead
  const wrapper = checkboxes[0].closest('[title]');
  expect(wrapper).toHaveAttribute('title', 'At least one column must remain visible');
});

test('clicking the last visible checkbox does not call onChange', async () => {
  const onChange = jest.fn();
  renderDropdown([{ key: 'a', label: 'Alpha' }], new Set(), onChange);
  const checkboxes = await openDropdown();
  fireEvent.click(checkboxes[0]);
  expect(onChange).not.toHaveBeenCalled();
});

test('Select all calls onChange with an empty set', async () => {
  const onChange = jest.fn();
  renderDropdown(TWO_COLS, new Set(['b']), onChange);
  await openDropdown();

  fireEvent.click(screen.getByText('Select all'));
  expect(onChange).toHaveBeenCalledWith(new Set());
});

test('Deselect all hides all columns except the first', async () => {
  const onChange = jest.fn();
  renderDropdown(THREE_COLS, new Set(), onChange);
  await openDropdown();

  fireEvent.click(screen.getByText('Deselect all'));
  expect(onChange).toHaveBeenCalledWith(new Set(['b', 'c']));
});

test('Deselect all with one column is a no-op', async () => {
  const onChange = jest.fn();
  renderDropdown([{ key: 'a', label: 'Alpha' }], new Set(), onChange);
  await openDropdown();

  fireEvent.click(screen.getByText('Deselect all'));
  expect(onChange).not.toHaveBeenCalled();
});
