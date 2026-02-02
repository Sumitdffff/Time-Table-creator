import React, { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import Typography from "material-ui/Typography";
import Paper from "material-ui/Paper";
import Grid from "material-ui/Grid";
import { createStyleSheet, withStyles } from "material-ui/styles";
import Dialog from "material-ui/Dialog";
import Button from "material-ui/Button";
import Slide from "material-ui/transitions/Slide";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import IconButton from "material-ui/IconButton";
import CloseIcon from "material-ui-icons/Close";
import jsPDF from "jspdf";
import "jspdf-autotable";

import base from "../../re-base";
import colors from "../../colors";
import "../AddTimeTable/timetabel.css";
import TimeTablelList from "./TimeTableList";

const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
const PERIODS = [
  { id: "sl1", label: "9:30-10:30\n1" },
  { id: "sl2", label: "10:30-11:30\n2" },
  { id: "sl3", label: "11:30-12:30\n3" },
  { id: "sl4", label: "12:30-1:30\n4" },
  { id: "break", label: "1:30-2:00" },
  { id: "sl5", label: "2:00-3:00\n5" },
  { id: "sl6", label: "3:00-4:00\n6" },
  { id: "sl7", label: "4:00-5:00\n7" },
];

class SavedTimeTables extends Component {
  state = {
    data: [],
    dialogOpen: false,
    selectedIndex: 0,
    teachers: [],
    rooms: [],
  };

  componentDidMount() {
    this.fetchTimeTables();

    base
      .fetch("teachers", { context: this, asArray: true })
      .then((data) => this.setState({ teachers: data || [] }));
    base
      .fetch("rooms", { context: this, asArray: true })
      .then((data) => this.setState({ rooms: data || [] }));
  }

  fetchTimeTables = () => {
    base
      .fetch("timeTables", { context: this, asArray: true })
      .then((data) => this.setState({ data }))
      .catch(console.error);
  };

  dialogOpen = (index) =>
    this.setState({ dialogOpen: true, selectedIndex: index });
  dialogClose = () => this.setState({ dialogOpen: false });

  delete = () => {
    const { data, selectedIndex } = this.state;
    base
      .remove(`timeTables/${data[selectedIndex].key}`)
      .then(() => {
        this.dialogClose();
        this.fetchTimeTables();
      })
      .catch(console.error);
  };

  // ✅ DOWNLOAD FUNCTION (ISI FILE ME)
  downloadTimeTable = () => {
    const { data, selectedIndex } = this.state;
    const timetable = data[selectedIndex];

    const doc = new jsPDF("landscape");

    // Title
    doc.setFontSize(16);
    doc.text(
      `Class: ${timetable.classInfo}  |  Semester: ${timetable.semester}  |  Shift: ${timetable.shift}`,
      14,
      15,
    );

    // Table header
    const head = [
      [
        "DAY",
        "9:30-10:30",
        "10:30-11:30",
        "11:30-12:30",
        "12:30-1:30",
        "LUNCH",
        "2:00-3:00",
        "3:00-4:00",
        "4:00-5:00",
      ],
    ];

    // Table body
    const body = DAYS.map((day, rowIndex) => {
      const row = timetable.data[rowIndex] || {};
      return [
        day,
        row.sl1 ? row.sl1[0] : "",
        row.sl2 ? row.sl2[0] : "",
        row.sl3 ? row.sl3[0] : "",
        row.sl4 ? row.sl4[0] : "",
        "LUNCH",
        row.sl5 ? row.sl5[0] : "",
        row.sl6 ? row.sl6[0] : "",
        row.sl7 ? row.sl7[0] : "",
      ];
    });

    doc.autoTable({
      startY: 25,
      head: head,
      body: body,
      styles: { fontSize: 9 },
    });

    // ✅ PDF DOWNLOAD
    doc.save(`timetable_${timetable.classInfo}_${timetable.semester}.pdf`);
  };
  renderCell = (rowIndex, periodId) => {
    const { data, selectedIndex, teachers, rooms } = this.state;
    if (!data[selectedIndex] || !data[selectedIndex].data) return null;
    const row = data[selectedIndex].data[rowIndex];
    if (!row || !row[periodId]) return null;

    const value = row[periodId];

    return (
      <div className="cell">
        <input value={value[0] || ""} disabled />
        <select value={value[1] || ""} disabled>
          <option>Not Set</option>
          {teachers.map((t) => (
            <option key={t.name}>{t.name}</option>
          ))}
        </select>
        <select value={value[2] || ""} disabled>
          <option>Not Set</option>
          {rooms.map((r) => (
            <option key={r.name}>{r.name}</option>
          ))}
        </select>
      </div>
    );
  };

  render() {
    const { classes } = this.props;
    const { data, dialogOpen, selectedIndex } = this.state;

    if (!data.length) return <Typography>Loading...</Typography>;
    const timetable = data[selectedIndex];

    return (
      <Grid container className={classes.container} justify="center">
        <Grid item xs={12} sm={8} md={6}>
          <Typography type="title" style={{ marginTop: 40 }} className={classes.title} align="center">
            Saved Time Tables
          </Typography>

          <TimeTablelList data={data} clickHandler={this.dialogOpen} />

          <Dialog
            fullScreen
            open={dialogOpen}
            transition={<Slide direction="up" />}
          >
            <AppBar className={classes.appBar}>
              <Toolbar>
                <IconButton color="contrast" onClick={this.dialogClose}>
                  <CloseIcon />
                </IconButton>
                <div className={classes.flex} />

                <Button
                  raised
                  color="secondary"
                  onClick={this.downloadTimeTable}
                >
                  Download
                </Button>

                <Button raised color="accent" onClick={this.delete}>
                  Delete
                </Button>
              </Toolbar>
            </AppBar>

            <Paper style={{ margin: 20, padding: 20 }}>
              <Typography>
                Class: {timetable.classInfo} | Semester: {timetable.semester} |
                Shift: {timetable.shift}
              </Typography>
            </Paper>

            <div style={{ maxHeight: "70vh", overflowY: "auto", margin: 20 }}>
              <table className="timetable">
                <thead>
                  <tr>
                    <th>DAY</th>
                    {PERIODS.map((p) => (
                      <th key={p.id}>{p.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day, i) => (
                    <tr key={day}>
                      <td>{day}</td>
                      {PERIODS.map((p) =>
                        p.id === "break" ? (
                          <td key="break">LUNCH</td>
                        ) : (
                          <td key={p.id}>{this.renderCell(i, p.id)}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Dialog>
        </Grid>
      </Grid>
    );
  }
}

const styleSheet = createStyleSheet({
  title: { margin: "40px 0 20px" },
  container: { justifyContent: "center" },
  appBar: { backgroundColor: colors.pinkDark },
  flex: { flex: 1 },
});

export default withRouter(withStyles(styleSheet)(SavedTimeTables));
