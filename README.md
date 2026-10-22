# Finora — Premium Personal Finance Dashboard

Finora is a responsive, frontend-only personal finance dashboard built with HTML5, CSS3, and vanilla JavaScript. It helps you record transactions, understand spending patterns, plan category budgets, track savings goals, and export your data — without a backend or bank connection.

> **Demo data notice:** The first launch seeds fictional Indian-rupee sample transactions across several months so charts and reports are useful immediately. These are not real bank records. Finora never connects to a bank account.

## Problem statement

Personal spending can become difficult to understand when income, bills, daily expenses, budgets, and longer-term savings plans are tracked in separate places. People need a clear, approachable view of cash flow and a way to compare actual spending against intentions.

## Proposed solution

Finora brings transaction management, month-based budget tracking, savings goal progress, visual trends, category breakdowns, and portable data backups into a single responsive browser application. Calculations are derived from the transactions stored in the app.

## Features

- Dashboard with total net balance, current-month income and expenses, and savings rate.
- Interactive cash-flow and category charts powered by Chart.js.
- Add, edit, delete, search, filter, and sort income and expense transactions.
- Monthly category budgets calculated from saved expense transactions.
- Savings goals with editable targets and goal-only contributions.
- Reports for monthly cash flow, category spend, largest expense, top category, and average recorded monthly spend.
- CSV transaction export and JSON full-app backup/restore.
- Dark and light themes, profile greeting, and display-currency formatting.
- Responsive navigation and layouts for desktop, tablet, and mobile.
- LocalStorage persistence; sample data is seeded only when no valid saved app state exists.

## Technology stack

- HTML5 and CSS3
- Vanilla JavaScript (no build step)
- [Chart.js](https://www.chartjs.org/) via jsDelivr CDN
- [Lucide static icon font](https://lucide.dev/) via jsDelivr CDN
- Browser LocalStorage, Blob downloads, and File API

The fonts and chart/icon libraries use CDNs, so an internet connection is needed for those external assets. The app's data and core calculations run locally in the browser. No API key or paid service is required.

## Project structure

```text
finora-personal-finance/
├── index.html
├── README.md
├── .gitignore
├── LICENSE
└── assets/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── app.js
    │   ├── storage.js
    │   ├── transactions.js
    │   ├── dashboard.js
    │   ├── budgets.js
    │   ├── goals.js
    │   └── reports.js
    └── images/
```

## Run locally in VS Code on Windows

1. Extract the ZIP file to a folder.
2. Open VS Code and choose **File → Open Folder**, then select `finora-personal-finance`.
3. Recommended: install the **Live Server** extension by Ritwick Dey.
4. Right-click `index.html` and choose **Open with Live Server**.
5. Your browser should open the dashboard. No Python, Node.js, PHP, database, or terminal server is required.

You can also double-click `index.html` to open it directly in a browser. Live Server is recommended for a consistent local development workflow.

## How to use

1. Review the sample data banner on first launch.
2. Use **Add transaction** to record income or expenses. The dashboard, charts, reports, and budgets update from saved records.
3. Use **Transactions** to search, filter, sort, edit, delete, or export transaction records.
4. Use **Budgets** to create a monthly limit for a category. Budget spend is the sum of expense transactions in that category in the current month.
5. Use **Savings goals** to create a target and record goal-only contributions. A contribution changes the goal tracker and **does not** create a duplicate expense transaction or transfer money.
6. Use **Reports** to select a month and inspect metrics and insights.
7. In **Settings**, change theme, display currency, profile name, export a full JSON backup, restore a valid backup, reset sample data, or clear app data.

### Display currency limitation

Changing the currency changes only the display format. It does not convert stored values using exchange rates. If you record ₹1,000 and switch the display currency to USD, the same numeric value is formatted as USD; it is not an actual currency conversion.

## Deploy with GitHub Pages

1. Create a GitHub repository, for example `finora-personal-finance`.
2. Upload or push the **contents** of this folder to the repository root (so `index.html` is at the root).
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select your main branch and `/ (root)`, then save.
6. Wait for GitHub Pages to publish the site and open the URL shown in the Pages settings.

No build command is needed. Ensure all files and folders retain their relative paths.

## Data and privacy

Finora stores application data in LocalStorage in the current browser profile on the current device. Data does not automatically synchronize between browsers or devices. Clearing browser/site data can remove Finora records. Anyone with access to the same browser profile may potentially access the app data, so this should not be treated as a secure vault. Use **Settings → Export full backup** to save a JSON copy somewhere safe.

Finora does not collect credentials, connect to bank accounts, use a backend, or transmit transaction data to a server. External CDN requests are used to load fonts, Chart.js, and icons.

## Limitations

- No bank sync, live account balances, payments, or financial institution integrations.
- No exchange-rate conversion; currency setting is formatting only.
- Data is local to the browser and is not encrypted by this application.
- Budget periods are calendar months, based on the browser's local date.
- The dashboard is for personal organization and educational demonstration, not financial, tax, or investment advice.
- Chart.js, icon fonts, and web fonts require an internet connection unless you replace the CDN references with local copies.

## License

Released under the MIT License. See `LICENSE`.
