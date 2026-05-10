export type RotationType =
  | 'none'
  | 'clockwise_90'
  | 'clockwise_180'
  | 'clockwise_270'
  | 'transpose'
  | 'horizontal_flip'
  | 'vertical_flip';

export const ROTATION_OPTIONS: readonly { value: RotationType; label: string }[] = [
  { value: 'none', label: 'No rotation' },
  { value: 'clockwise_90', label: '90° clockwise' },
  { value: 'clockwise_180', label: '180°' },
  { value: 'clockwise_270', label: '270° clockwise (90° counter)' },
  { value: 'transpose', label: 'Transpose (rows ↔ columns)' },
  { value: 'horizontal_flip', label: 'Horizontal flip (mirror)' },
  { value: 'vertical_flip', label: 'Vertical flip (mirror)' },
] as const;
