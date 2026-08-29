UPDATE payment_methods SET name = 'Cash' WHERE slug = 'cash';
UPDATE payment_methods SET name = 'E-Wallet' WHERE slug = 'wallet';
UPDATE payment_methods SET name = 'Bank Transfer' WHERE slug = 'bank_transfer';
UPDATE payment_methods SET name = 'Payment Card' WHERE slug = 'card';
UPDATE payment_methods SET name = 'Other' WHERE slug = 'other';
