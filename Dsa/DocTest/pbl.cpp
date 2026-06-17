#include <iostream>
#include <fstream>
#include <string>
#include <windows.h>
#include <sstream>
using namespace std;

class Song {
public:
    int id;
    string name;
    string artist;
    Song* prev;
    Song* next;

    Song(int songId, string songName, string artistName) {
        id = songId;
        name = songName;
        artist = artistName;
        prev = this;
        next = this;
    }
};

class Playlist {
    Song* head;
    Song* tail;
    Song* current;
    int songIdCounter; 

public:
    Playlist() {
        head = NULL;
        tail = NULL;
        current = NULL;
        songIdCounter = 1;
    }

    bool songExists(const string& name) {
        Song* temp = head;
        if (!temp) return false;
        do {
            if (temp->name == name) {
                return true;
            }
            temp = temp->next;
        } while (temp != head);
        return false;
    }

    string getValidInput(const string& prompt) {
        string input;
        while (true) {
            cout << prompt;
            getline(cin, input);

            bool isValid = true;
            for (int i = 0; i < input.size(); ++i) {
		    char ch = input[i];
		    if (!isalnum(ch) && ch != ' ' && ch != '.' && ch != ',' && ch != '!' && ch != '?' && ch != '\'' && ch != '-') {
		        isValid = false;
		        break;
		    }
		}

            if (!input.empty() && isValid) break;

            cout << "Invalid input! Please use only letters, numbers, spaces, or basic punctuation.\n";
        }
        return input;
    }

    void loadFromFile() {
    ifstream inFile("playlist.txt");
    if (!inFile) {
        return;
    }

    string line;
    int id;
    string name, artist;

    while (getline(inFile, line)) {
        stringstream ss(line);
        ss >> id;
        
        if (!getline(inFile, name) || !getline(inFile, artist)) {
            break; 
        }

        Song* newSong = new Song(id, name, artist);
        if (!head) {
            head = tail = newSong;
        } else {
            tail->next = newSong;
            newSong->prev = tail;
            tail = newSong;
        }
        tail->next = head;
        head->prev = tail;
    }

    inFile.close();
}

    void addSong() {
    string name = getValidInput("Enter song name: ");
    string artist = getValidInput("Enter artist name: ");

    Song* temp = head;
    if (temp) {
        do {
            if (temp->name == name && temp->artist == artist) {
                cout << "This song by the same artist already exists in the playlist!\n";
                return;
            }
            temp = temp->next;
        } while (temp != head);
    }

    Song* newSong = new Song(songIdCounter++, name, artist);
    if (!head) {
        head = tail = newSong;
    } else {
        tail->next = newSong;
        newSong->prev = tail;
        tail = newSong;
    }
    tail->next = head;
    head->prev = tail;

    cout << "Song added successfully!\n";
}

    void viewPlaylist() {
        if (!head) {
            cout << "Playlist is empty!\n";
            return;
        }

        Song* temp = head;
        cout << "\nPlaylist:\n";
        do {
            cout << "ID: " << temp->id << " | Song: " << temp->name << " | Artist: " << temp->artist << endl;
            temp = temp->next;
        } while (temp != head);
    }

    void deleteSong() {
    if (!head) {
        cout << "Playlist is empty!\n";
        return;
    }

    string name = getValidInput("Enter song name to delete: ");
    string artist = getValidInput("Enter artist name to delete: ");
    Song* temp = head;

    do {
        if (temp->name == name && temp->artist == artist) {
            if (temp == head && temp == tail) {
                head = tail = NULL;
            } else if (temp == head) {
                head = head->next;
                head->prev = tail;
                tail->next = head;
            } else if (temp == tail) {
                tail = tail->prev;
                tail->next = head;
                head->prev = tail;
            } else {
                temp->prev->next = temp->next;
                temp->next->prev = temp->prev;
            }

            delete temp;
            cout << "Song deleted successfully!\n";
            return;
        }
        temp = temp->next;
    } while (temp != head);

    cout << "Song not found!\n";
}

    void searchSong() {
    if (!head) {
        cout << "Playlist is empty!\n";
        return;
    }

    string name = getValidInput("Enter song name to search: ");
    string artist = getValidInput("Enter artist name to search: ");
    Song* temp = head;

    do {
        if (temp->name == name && temp->artist == artist) {
            cout << "Song found: " << temp->name << " | Artist: " << temp->artist << endl;
            return;
        }
        temp = temp->next;
    } while (temp != head);

    cout << "Song not found!\n";
	}

    void playTopSong() {
        if (!head) {
            cout << "Playlist is empty!\n";
            return;
        }

        current = head;
        cout << "Now playing: " << current->name << " by " << current->artist << endl;
    }

    void playNextSong() {
        if (!current) {
            cout << "No song is currently playing.\n";
            return;
        }

        current = current->next;
        cout << "Now playing: " << current->name << " by " << current->artist << endl;
    }

    void playPreviousSong() {
        if (!current) {
            cout << "No song is currently playing.\n";
            return;
        }

        current = current->prev;
        cout << "Now playing: " << current->name << " by " << current->artist << endl;
    }

   void renameSong() {
    if (!head) {
        cout << "Playlist is empty!\n";
        return;
    }

    string oldName = getValidInput("Enter the name of the song to rename: ");
    string oldArtist = getValidInput("Enter the artist name of the song to rename: ");
    
    Song* temp = head;

    do {
        if (temp->name == oldName && temp->artist == oldArtist) {
            string newName = getValidInput("Enter the new name for the song: ");
            string newArtist = getValidInput("Enter the new artist name for the song: ");

            if (songExists(newName)) {
                cout << "A song with the new name already exists in the playlist!\n";
                return;
            }

            temp->name = newName;
            temp->artist = newArtist;
            cout << "Song renamed successfully!\n";
            return;
        }
        temp = temp->next;
    } while (temp != head);

    cout << "Song not found!\n";
	}

	void sortPlaylist() {
        if (!head || !head->next) {
            cout << "Playlist is already sorted or empty!\n";
            return;
        }

        Song* current = head;
        while (current != tail) {
            Song* min = current;
            Song* temp = current->next;

            while (temp != head) {
                if (temp->name < min->name) {
                    min = temp;
                }
                temp = temp->next;
            }

            if (min != current) {
                swap(current->name, min->name);
                swap(current->artist, min->artist);
            }

            current = current->next;
        }

        cout << "Playlist sorted successfully!\n";
    } 
    void saveToFile() {
    ofstream outFile("playlist.txt"); 
    if (!outFile) {
        cout << "Error opening file! Please check your file path or permissions.\n";
        return;
    }

    Song* temp = head;
    do {
        outFile << temp->id << "\n" << temp->name << "\n" << temp->artist << "\n";
        temp = temp->next;
    } while (temp != head);

    outFile.close();
  
	}

	};

