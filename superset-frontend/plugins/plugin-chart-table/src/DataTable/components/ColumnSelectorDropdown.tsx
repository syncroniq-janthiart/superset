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
/* eslint-disable import/no-extraneous-dependencies */
import { ReactNode, useState } from 'react';
import { css } from '@apache-superset/core/theme';
import { t } from '@apache-superset/core/translation';
import {
  Button,
  Checkbox,
  Divider,
  Dropdown,
  Space,
} from '@superset-ui/core/components';
import { Icons } from '@superset-ui/core/components/Icons';

export interface ColumnSelectorOption {
  key: string;
  label: ReactNode;
}

export interface ColumnSelectorDropdownProps {
  /** Author-visible columns offered as options. */
  columns: ColumnSelectorOption[];
  /** Keys the end user has chosen to hide. */
  hiddenColumns: Set<string>;
  /** Called with the next hidden set whenever the selection changes. */
  onChange: (hiddenColumns: Set<string>) => void;
}

function ColumnSelectorDropdown({
  columns,
  hiddenColumns,
  onChange,
}: ColumnSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const label = t('Show/hide columns');

  const visibleCount = columns.filter(
    col => !hiddenColumns.has(col.key),
  ).length;

  const toggle = (key: string) => {
    const next = new Set(hiddenColumns);
    if (next.has(key)) {
      next.delete(key);
    } else {
      // Keep at least one column visible.
      if (visibleCount <= 1) {
        return;
      }
      next.add(key);
    }
    onChange(next);
  };

  const selectAll = () => onChange(new Set());
  // Deselect all keeps the first column visible (>= 1 column rule).
  const deselectAll = () =>
    onChange(new Set(columns.slice(1).map(col => col.key)));

  const overlay = (
    <div
      data-test="column-selector-overlay"
      css={theme => css`
        background-color: ${theme.colorBgElevated};
        border-radius: ${theme.borderRadius}px;
        box-shadow: ${theme.boxShadowSecondary};
        padding: ${theme.sizeUnit * 3}px;
        min-width: 180px;
      `}
    >
      <Space size="middle">
        <Button buttonStyle="link" onClick={selectAll}>
          {t('Select all')}
        </Button>
        <Button buttonStyle="link" onClick={deselectAll}>
          {t('Deselect all')}
        </Button>
      </Space>
      <Divider />
      <div
        css={theme => css`
          max-height: ${theme.sizeUnit * 60}px;
          overflow-y: auto;
        `}
      >
        <Space direction="vertical" size={4}>
          {columns.map(col => {
            const checked = !hiddenColumns.has(col.key);
            return (
              <Checkbox
                key={col.key}
                checked={checked}
                disabled={checked && visibleCount <= 1}
                onChange={() => toggle(col.key)}
              >
                {col.label}
              </Checkbox>
            );
          })}
        </Space>
      </div>
    </div>
  );

  return (
    <Dropdown
      placement="bottomRight"
      trigger={['click']}
      open={open}
      onOpenChange={setOpen}
      popupRender={() => overlay}
    >
      <Button buttonStyle="link" aria-label={label} title={label}>
        <Icons.UnorderedListOutlined />
      </Button>
    </Dropdown>
  );
}

export default ColumnSelectorDropdown;
